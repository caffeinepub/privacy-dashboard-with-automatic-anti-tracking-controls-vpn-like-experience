import Map "mo:core/Map";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";
import Text "mo:core/Text";

(with migration = Migration.run)
actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  public type PrivacySettings = {
    autoStopTracking : Bool;
    blockList : [Text];
  };

  public type BlocklistUpdateResult = {
    newBlocklist : [Text];
    success : Bool;
    message : Text;
  };

  public type CustomDomainConfig = {
    desiredDomain : Text;
    canonicalUrl : Text;
    requirements : Text;
    status : CustomDomainStatus;
    instructions : Text;
    dnsSetupHelp : Text;
  };

  public type CustomDomainStatus = {
    #pending;
    #configured;
    #error : Text;
  };

  public type CustomDomainConfigUpdate = {
    canonicalUrl : Text;
    requirements : Text;
    status : CustomDomainStatus;
    instructions : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userSettings = Map.empty<Principal, PrivacySettings>();

  var customDomainConfig : ?CustomDomainConfig = null;

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Custom Domain Functions
  public shared ({ caller }) func proposeCustomDomain(domain : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Only admins can configure a custom domain");
    };

    customDomainConfig := ?{
      desiredDomain = domain;
      canonicalUrl = "/";
      requirements = "Must point domain to Internet Computer boundary node using CNAME.";
      status = #pending;
      instructions = "CNAME <app_path>.icp0.io. (Will resolve on mainnet)";
      dnsSetupHelp = "Create CNAME record for desired domain pointing to canonical URL (full path must include \".icp0.network\")";
    };
  };

  public shared ({ caller }) func updateCustomDomainConfig(update : CustomDomainConfigUpdate) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Only admins can configure a custom domain");
    };
    switch (customDomainConfig) {
      case (null) {
        customDomainConfig := ?{
          desiredDomain = "not set, call proposeCustomDomain first";
          canonicalUrl = update.canonicalUrl;
          requirements = update.requirements;
          status = update.status;
          instructions = update.instructions;
          dnsSetupHelp = "Should not happen, call proposeCustomDomain first";
        };
      };
      case (?existingConfig) {
        customDomainConfig := ?{
          existingConfig with
          canonicalUrl = update.canonicalUrl;
          requirements = update.requirements;
          status = update.status;
          instructions = update.instructions;
        };
      };
    };
  };

  public query ({ caller }) func getCustomDomainConfig() : async ?CustomDomainConfig {
    customDomainConfig;
  };

  // Privacy Settings Functions
  public shared ({ caller }) func getPrivacySettings() : async PrivacySettings {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access privacy settings");
    };

    switch (userSettings.get(caller)) {
      case (?settings) { settings };
      case (null) {
        let defaultSettings : PrivacySettings = {
          autoStopTracking = true;
          blockList = [];
        };
        userSettings.add(caller, defaultSettings);
        defaultSettings;
      };
    };
  };

  public shared ({ caller }) func setAutoStopTracking(autoStop : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can modify privacy settings");
    };

    let currentSettings = switch (userSettings.get(caller)) {
      case (?settings) { settings };
      case (null) {
        let newSettings : PrivacySettings = {
          autoStopTracking = autoStop;
          blockList = [];
        };
        userSettings.add(caller, newSettings);
        return;
      };
    };

    let updatedSettings : PrivacySettings = {
      autoStopTracking = autoStop;
      blockList = currentSettings.blockList;
    };

    userSettings.add(caller, updatedSettings);
  };

  public shared ({ caller }) func addBlockEntry(domain : Text) : async BlocklistUpdateResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can modify blocklist");
    };

    switch (userSettings.get(caller)) {
      case (null) {
        let newSettings : PrivacySettings = {
          autoStopTracking = true;
          blockList = [domain];
        };
        userSettings.add(caller, newSettings);
        {
          newBlocklist = [domain];
          success = true;
          message = "Domain added to new blocklist";
        };
      };
      case (?settings) {
        let currentBlocklist = Set.fromArray(settings.blockList);
        if (currentBlocklist.contains(domain)) {
          return {
            newBlocklist = currentBlocklist.toArray();
            success = false;
            message = "Domain already blocked";
          };
        };

        currentBlocklist.add(domain);
        let updatedSettings : PrivacySettings = {
          autoStopTracking = settings.autoStopTracking;
          blockList = currentBlocklist.toArray();
        };

        userSettings.add(caller, updatedSettings);
        {
          newBlocklist = currentBlocklist.toArray();
          success = true;
          message = "Domain added to blocklist";
        };
      };
    };
  };

  public shared ({ caller }) func removeBlockEntry(domain : Text) : async BlocklistUpdateResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can modify blocklist");
    };

    switch (userSettings.get(caller)) {
      case (null) { Runtime.trap("No settings found for caller") };
      case (?settings) {
        let currentBlocklist = Set.fromArray(settings.blockList);
        if (not currentBlocklist.contains(domain)) {
          return {
            newBlocklist = currentBlocklist.toArray();
            success = false;
            message = "Domain not found in blocklist";
          };
        };

        currentBlocklist.remove(domain);
        let updatedSettings : PrivacySettings = {
          autoStopTracking = settings.autoStopTracking;
          blockList = currentBlocklist.toArray();
        };

        userSettings.add(caller, updatedSettings);
        {
          newBlocklist = currentBlocklist.toArray();
          success = true;
          message = "Domain removed from blocklist";
        };
      };
    };
  };
};
