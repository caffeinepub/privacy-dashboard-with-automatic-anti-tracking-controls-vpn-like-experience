import Map "mo:core/Map";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

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

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userSettings = Map.empty<Principal, PrivacySettings>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Privacy Settings Functions
  public shared ({ caller }) func getPrivacySettings() : async PrivacySettings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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
