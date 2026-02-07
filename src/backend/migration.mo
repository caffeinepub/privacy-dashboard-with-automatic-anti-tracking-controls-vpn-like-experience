import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    userSettings : Map.Map<Principal, { autoStopTracking : Bool; blockList : [Text] }>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    userSettings : Map.Map<Principal, { autoStopTracking : Bool; blockList : [Text] }>;
    customDomainConfig : ?{
      desiredDomain : Text;
      canonicalUrl : Text;
      requirements : Text;
      status : {
        #pending;
        #configured;
        #error : Text;
      };
      instructions : Text;
      dnsSetupHelp : Text;
    };
  };

  public func run(old : OldActor) : NewActor {
    {
      userProfiles = old.userProfiles;
      userSettings = old.userSettings;
      customDomainConfig = null;
    };
  };
};
