import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  // Initialize Access Control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile type
  public type UserProfile = {
    name : Text;
  };

  // Effect type
  type Effect = {
    name : Text;
    category : Text;
    parameters : Text;
  };

  // Project type
  type Project = {
    name : Text;
    creationTime : Time.Time;
    lastModified : Time.Time;
    effects : [Effect];
    videoBlob : Storage.ExternalBlob;
  };

  // Store user profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Store projects per user: Principal -> (ProjectName -> Project)
  let userProjects = Map.empty<Principal, Map.Map<Text, Project>>();

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

  // Project Management Functions
  public shared ({ caller }) func createProject(name : Text, videoBlob : Storage.ExternalBlob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create projects");
    };

    let project : Project = {
      name;
      creationTime = Time.now();
      lastModified = Time.now();
      effects = [];
      videoBlob;
    };

    // Get or create the user's project map
    let projects = switch (userProjects.get(caller)) {
      case (null) {
        let newMap = Map.empty<Text, Project>();
        userProjects.add(caller, newMap);
        newMap;
      };
      case (?existingMap) { existingMap };
    };

    // Check if project name already exists for this user
    if (projects.containsKey(name)) {
      Runtime.trap("Project with this name already exists");
    };

    projects.add(name, project);
  };

  public query ({ caller }) func getProject(user : Principal, name : Text) : async Project {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access projects");
    };

    // Users can only access their own projects unless they are admin
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only access your own projects");
    };

    switch (userProjects.get(user)) {
      case (null) { Runtime.trap("User has no projects") };
      case (?projects) {
        switch (projects.get(name)) {
          case (null) { Runtime.trap("Project does not exist") };
          case (?project) { project };
        };
      };
    };
  };

  public shared ({ caller }) func updateProject(name : Text, effects : [Effect]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update projects");
    };

    switch (userProjects.get(caller)) {
      case (null) { Runtime.trap("You have no projects") };
      case (?projects) {
        switch (projects.get(name)) {
          case (null) { Runtime.trap("Project does not exist") };
          case (?existingProject) {
            let updatedProject : Project = {
              existingProject with
              lastModified = Time.now();
              effects;
            };
            projects.add(name, updatedProject);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteProject(name : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete projects");
    };

    switch (userProjects.get(caller)) {
      case (null) { Runtime.trap("You have no projects") };
      case (?projects) {
        if (not projects.containsKey(name)) {
          Runtime.trap("Project does not exist");
        };
        projects.remove(name);
      };
    };
  };

  public query ({ caller }) func listProjects() : async [Project] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can list projects");
    };

    // Return only the caller's projects
    switch (userProjects.get(caller)) {
      case (null) { [] };
      case (?projects) {
        projects.values().toArray();
      };
    };
  };
};
