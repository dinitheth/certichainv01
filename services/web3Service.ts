import { readContract } from '@wagmi/core';
import { config } from '../wagmiConfig';
import { CertificateData } from '../types';
import { CERTIFICATE_NFT_ABI, CERTIFICATE_NFT_ADDRESS_DEFAULT, INSTITUTION_REGISTRY_ABI, REGISTRY_ADDRESS_DEFAULT } from '../constants';

export const checkInstitutionStatus = async (address: string): Promise<boolean> => {
    try {
        const isAuthorized = await readContract(config, {
            address: REGISTRY_ADDRESS_DEFAULT as `0x${string}`,
            abi: INSTITUTION_REGISTRY_ABI as any,
            functionName: 'isAuthorized',
            args: [address as `0x${string}`]
        });
        return isAuthorized as unknown as boolean;
    } catch (e) {
        return false;
    }
}

// Fetch certificate using Wagmi Core
export const fetchCertificate = async (
  tokenId: string
): Promise<CertificateData | null> => {
  try {
    const data = await readContract(config, {
      address: CERTIFICATE_NFT_ADDRESS_DEFAULT as `0x${string}`,
      abi: CERTIFICATE_NFT_ABI as any,
      functionName: 'getCertificate',
      args: [BigInt(tokenId)],
    });

    const result = data as any;
    
    // Check if issuer is active
    let isInstitutionActive = false;
    if (result.issuer) {
        isInstitutionActive = await checkInstitutionStatus(result.issuer);
    }
    
    return {
      id: tokenId,
      issuer: result.issuer,
      studentName: result.studentNameHash,
      studentEmailHash: result.studentEmailHash,
      studentAddress: "Hidden",
      course: result.course,
      issueDate: Number(result.issueDate),
      enrollmentDate: Number(result.enrollmentDate),
      isValid: result.isValid,
      ipfsHash: result.ipfsHash,
      revokeReason: result.revokeReason,
      isInstitutionActive
    };
  } catch (e) {
    console.error("Error fetching cert", e);
    return null;
  }
};

export const fetchCertificateIdByHash = async (dataHash: string): Promise<string | null> => {
  try {
    const tokenId = await readContract(config, {
      address: CERTIFICATE_NFT_ADDRESS_DEFAULT as `0x${string}`,
      abi: CERTIFICATE_NFT_ABI as any,
      functionName: 'getCertificateByHash',
      args: [dataHash as `0x${string}`],
    });
    return (tokenId as bigint).toString();
  } catch (e) {
    console.error("Error fetching cert by hash", e);
    return null;
  }
};