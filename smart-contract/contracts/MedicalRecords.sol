// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MediChainConsent {
    enum RequestStatus {
        None,
        Pending,
        Approved,
        Rejected,
        Revoked
    }

    struct Doctor {
        string name;
        string specialty;
        bool registered;
    }

    struct Patient {
        string name;
        bool registered;
    }

    struct AccessRequest {
        address doctor;
        string message;
        RequestStatus status;
        uint256 timestamp;
    }

    struct MedicalEntry {
        address doctor;
        address patient;
        string entryType;
        string ipfsHash;
        string title;
        string notes;
        uint256 timestamp;
    }

    mapping(address => Doctor) public doctors;
    mapping(address => Patient) public patients;
    mapping(address => mapping(address => bool)) private authorizedDoctors;
    mapping(address => mapping(address => AccessRequest)) public accessRequests;
    mapping(address => address[]) private patientRequestDoctors;
    mapping(address => MedicalEntry[]) private patientEntries;

    event DoctorRegistered(address indexed doctor, string name, string specialty);
    event PatientRegistered(address indexed patient, string name);
    event AccessRequested(address indexed doctor, address indexed patient, string message);
    event AccessResponded(address indexed patient, address indexed doctor, bool approved);
    event AccessRevoked(address indexed patient, address indexed doctor);
    event MedicalEntryAdded(
        address indexed doctor,
        address indexed patient,
        string entryType,
        string ipfsHash,
        string title
    );

    modifier onlyRegisteredDoctor() {
        require(doctors[msg.sender].registered, "Doctor not registered");
        _;
    }

    modifier onlyRegisteredPatient() {
        require(patients[msg.sender].registered, "Patient not registered");
        _;
    }

    function registerDoctor(string calldata name, string calldata specialty) external {
        require(!doctors[msg.sender].registered, "Doctor already registered");
        require(!patients[msg.sender].registered, "Address already used by patient");
        require(bytes(name).length > 0, "Doctor name is required");
        require(bytes(specialty).length > 0, "Specialty is required");

        doctors[msg.sender] = Doctor(name, specialty, true);
        emit DoctorRegistered(msg.sender, name, specialty);
    }

    function registerPatient(string calldata name) external {
        require(!patients[msg.sender].registered, "Patient already registered");
        require(!doctors[msg.sender].registered, "Address already used by doctor");
        require(bytes(name).length > 0, "Patient name is required");

        patients[msg.sender] = Patient(name, true);
        emit PatientRegistered(msg.sender, name);
    }

    function requestAccess(address patient, string calldata message) external onlyRegisteredDoctor {
        require(patients[patient].registered, "Patient not registered");

        AccessRequest storage request = accessRequests[patient][msg.sender];
        require(request.status != RequestStatus.Pending, "Request already pending");
        require(request.status != RequestStatus.Approved, "Doctor already authorized");

        if (request.timestamp == 0) {
            patientRequestDoctors[patient].push(msg.sender);
        }

        accessRequests[patient][msg.sender] = AccessRequest({
            doctor: msg.sender,
            message: message,
            status: RequestStatus.Pending,
            timestamp: block.timestamp
        });

        emit AccessRequested(msg.sender, patient, message);
    }

    function respondToRequest(address doctor, bool approve) external onlyRegisteredPatient {
        AccessRequest storage request = accessRequests[msg.sender][doctor];
        require(request.status == RequestStatus.Pending, "No pending request");

        request.status = approve ? RequestStatus.Approved : RequestStatus.Rejected;
        authorizedDoctors[msg.sender][doctor] = approve;

        emit AccessResponded(msg.sender, doctor, approve);
    }

    function revokeAccess(address doctor) external onlyRegisteredPatient {
        require(authorizedDoctors[msg.sender][doctor], "Doctor is not authorized");

        authorizedDoctors[msg.sender][doctor] = false;
        accessRequests[msg.sender][doctor].status = RequestStatus.Revoked;

        emit AccessRevoked(msg.sender, doctor);
    }

    function addMedicalEntry(
        address patient,
        string calldata entryType,
        string calldata ipfsHash,
        string calldata title,
        string calldata notes
    ) external onlyRegisteredDoctor {
        require(patients[patient].registered, "Patient not registered");
        require(authorizedDoctors[patient][msg.sender], "Doctor not authorized");
        require(bytes(entryType).length > 0, "Entry type is required");
        require(bytes(title).length > 0, "Title is required");
        require(bytes(ipfsHash).length > 0, "IPFS hash is required");

        patientEntries[patient].push(
            MedicalEntry({
                doctor: msg.sender,
                patient: patient,
                entryType: entryType,
                ipfsHash: ipfsHash,
                title: title,
                notes: notes,
                timestamp: block.timestamp
            })
        );

        emit MedicalEntryAdded(msg.sender, patient, entryType, ipfsHash, title);
    }

    function getPatientEntries(address patient) external view returns (MedicalEntry[] memory) {
        require(
            msg.sender == patient || authorizedDoctors[patient][msg.sender],
            "Not allowed to view records"
        );

        return patientEntries[patient];
    }

    function getPendingRequests(address patient) external view returns (AccessRequest[] memory) {
        require(msg.sender == patient, "Only patient can view pending requests");

        address[] memory doctorList = patientRequestDoctors[patient];
        uint256 pendingCount = 0;

        for (uint256 i = 0; i < doctorList.length; i++) {
            if (accessRequests[patient][doctorList[i]].status == RequestStatus.Pending) {
                pendingCount += 1;
            }
        }

        AccessRequest[] memory pendingRequests = new AccessRequest[](pendingCount);
        uint256 index = 0;

        for (uint256 i = 0; i < doctorList.length; i++) {
            AccessRequest memory request = accessRequests[patient][doctorList[i]];
            if (request.status == RequestStatus.Pending) {
                pendingRequests[index] = request;
                index += 1;
            }
        }

        return pendingRequests;
    }

    function getPatientRequests(address patient) external view returns (AccessRequest[] memory) {
        require(msg.sender == patient, "Only patient can view requests");

        address[] memory doctorList = patientRequestDoctors[patient];
        AccessRequest[] memory requests = new AccessRequest[](doctorList.length);

        for (uint256 i = 0; i < doctorList.length; i++) {
            requests[i] = accessRequests[patient][doctorList[i]];
        }

        return requests;
    }

    function isAuthorized(address patient, address doctor) external view returns (bool) {
        return authorizedDoctors[patient][doctor];
    }
}
