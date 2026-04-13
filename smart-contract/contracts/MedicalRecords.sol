// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MedicalRecords {
    struct Record {
        address patient;
        address doctor;
        string ipfsHash;
        string description;
        uint256 timestamp;
    }

    mapping(uint256 => Record) public records;
    mapping(address => uint256[]) public patientRecordIds;
    mapping(address => mapping(address => bool)) public accessAllowed;
    mapping(address => bool) public doctors;
    mapping(address => bool) public admins;
    uint256 public recordCount;

    event RecordUploaded(uint256 indexed recordId, address indexed patient, address indexed doctor, string ipfsHash);
    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);

    modifier onlyAdmin() {
        require(admins[msg.sender], "Admin only");
        _;
    }

    modifier onlyDoctor() {
        require(doctors[msg.sender], "Doctor only");
        _;
    }

    constructor() {
        admins[msg.sender] = true;
    }

    function addDoctor(address doctor) external onlyAdmin {
        doctors[doctor] = true;
    }

    function removeDoctor(address doctor) external onlyAdmin {
        doctors[doctor] = false;
    }

    function grantAccess(address doctor) external {
        accessAllowed[msg.sender][doctor] = true;
        emit AccessGranted(msg.sender, doctor);
    }

    function revokeAccess(address doctor) external {
        accessAllowed[msg.sender][doctor] = false;
        emit AccessRevoked(msg.sender, doctor);
    }

    function uploadRecord(address patient, string calldata ipfsHash, string calldata description) external onlyDoctor {
        require(accessAllowed[patient][msg.sender], "Access not granted by patient");
        recordCount += 1;
        records[recordCount] = Record(patient, msg.sender, ipfsHash, description, block.timestamp);
        patientRecordIds[patient].push(recordCount);
        emit RecordUploaded(recordCount, patient, msg.sender, ipfsHash);
    }

    function getPatientRecords(address patient) external view returns (Record[] memory) {
        uint256[] memory ids = patientRecordIds[patient];
        Record[] memory patientRecords = new Record[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            patientRecords[i] = records[ids[i]];
        }
        return patientRecords;
    }

    function canView(address patient, address doctor) external view returns (bool) {
        return accessAllowed[patient][doctor];
    }
}
