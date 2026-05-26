const assert = require("node:assert/strict");
const { ethers } = require("hardhat");

describe("MediChainConsent", function () {
  async function deployFixture() {
    const [patient, doctor, otherDoctor] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("MediChainConsent");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();
    return { contract, patient, doctor, otherDoctor };
  }

  it("registers doctor and patient profiles", async function () {
    const { contract, patient, doctor } = await deployFixture();

    await (await contract.connect(patient).registerPatient("Alice")).wait();
    await (await contract.connect(doctor).registerDoctor("Dr Bob", "Cardiology")).wait();

    const patientProfile = await contract.patients(await patient.getAddress());
    const doctorProfile = await contract.doctors(await doctor.getAddress());

    assert.equal(patientProfile.name, "Alice");
    assert.equal(patientProfile.registered, true);
    assert.equal(doctorProfile.name, "Dr Bob");
    assert.equal(doctorProfile.specialty, "Cardiology");
    assert.equal(doctorProfile.registered, true);
  });

  it("supports request, approve, entry creation, and history reads", async function () {
    const { contract, patient, doctor } = await deployFixture();
    const patientAddress = await patient.getAddress();
    const doctorAddress = await doctor.getAddress();

    await (await contract.connect(patient).registerPatient("Alice")).wait();
    await (await contract.connect(doctor).registerDoctor("Dr Bob", "Cardiology")).wait();
    await (await contract.connect(doctor).requestAccess(patientAddress, "Need access for diagnosis")).wait();

    const pending = await contract.connect(patient).getPendingRequests(patientAddress);
    assert.equal(pending.length, 1);
    assert.equal(pending[0].doctor, doctorAddress);
    assert.equal(pending[0].message, "Need access for diagnosis");

    await (await contract.connect(patient).respondToRequest(doctorAddress, true)).wait();

    const authorized = await contract.isAuthorized(patientAddress, doctorAddress);
    assert.equal(authorized, true);

    await (
      await contract
        .connect(doctor)
        .addMedicalEntry(
          patientAddress,
          "Prescription",
          "QmHash123",
          "Recovery Plan",
          "Take medicine after meals"
        )
    ).wait();

    const entriesForPatient = await contract.connect(patient).getPatientEntries(patientAddress);
    const entriesForDoctor = await contract.connect(doctor).getPatientEntries(patientAddress);

    assert.equal(entriesForPatient.length, 1);
    assert.equal(entriesForDoctor.length, 1);
    assert.equal(entriesForPatient[0].entryType, "Prescription");
    assert.equal(entriesForPatient[0].title, "Recovery Plan");
    assert.equal(entriesForPatient[0].notes, "Take medicine after meals");
  });

  it("supports reject and later re-request flow", async function () {
    const { contract, patient, doctor } = await deployFixture();
    const patientAddress = await patient.getAddress();
    const doctorAddress = await doctor.getAddress();

    await (await contract.connect(patient).registerPatient("Alice")).wait();
    await (await contract.connect(doctor).registerDoctor("Dr Bob", "Cardiology")).wait();
    await (await contract.connect(doctor).requestAccess(patientAddress, "First attempt")).wait();
    await (await contract.connect(patient).respondToRequest(doctorAddress, false)).wait();

    const firstStatus = await contract.accessRequests(patientAddress, doctorAddress);
    assert.equal(Number(firstStatus.status), 3);

    await (await contract.connect(doctor).requestAccess(patientAddress, "Second attempt")).wait();
    const secondPending = await contract.connect(patient).getPendingRequests(patientAddress);
    assert.equal(secondPending.length, 1);
    assert.equal(secondPending[0].message, "Second attempt");
  });

  it("revokes approved access and blocks future entry writes", async function () {
    const { contract, patient, doctor } = await deployFixture();
    const patientAddress = await patient.getAddress();
    const doctorAddress = await doctor.getAddress();

    await (await contract.connect(patient).registerPatient("Alice")).wait();
    await (await contract.connect(doctor).registerDoctor("Dr Bob", "Cardiology")).wait();
    await (await contract.connect(doctor).requestAccess(patientAddress, "Need access")).wait();
    await (await contract.connect(patient).respondToRequest(doctorAddress, true)).wait();
    await (await contract.connect(patient).revokeAccess(doctorAddress)).wait();

    const authorized = await contract.isAuthorized(patientAddress, doctorAddress);
    assert.equal(authorized, false);

    await assert.rejects(
      contract
        .connect(doctor)
        .addMedicalEntry(patientAddress, "Visit", "QmHash123", "Follow up", "Should fail"),
      /Doctor not authorized/
    );
  });

  it("blocks unauthorized viewers from reading patient history", async function () {
    const { contract, patient, doctor, otherDoctor } = await deployFixture();
    const patientAddress = await patient.getAddress();
    const doctorAddress = await doctor.getAddress();

    await (await contract.connect(patient).registerPatient("Alice")).wait();
    await (await contract.connect(doctor).registerDoctor("Dr Bob", "Cardiology")).wait();
    await (await contract.connect(otherDoctor).registerDoctor("Dr Eve", "Neurology")).wait();
    await (await contract.connect(doctor).requestAccess(patientAddress, "Need access")).wait();
    await (await contract.connect(patient).respondToRequest(doctorAddress, true)).wait();
    await (
      await contract
        .connect(doctor)
        .addMedicalEntry(patientAddress, "Lab Report", "QmHash123", "CBC", "Normal results")
    ).wait();

    await assert.rejects(
      contract.connect(otherDoctor).getPatientEntries(patientAddress),
      /Not allowed to view records/
    );
  });
});
