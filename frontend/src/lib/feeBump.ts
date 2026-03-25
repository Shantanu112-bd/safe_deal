// FeeSponsor account logic is now entirely handled server-side at /api/sponsor 

export async function wrapWithFeeBump(
  innerTransactionXDR: string
): Promise<string> {
  try {
    const res = await fetch('/api/sponsor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signedXdr: innerTransactionXDR })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Sponsorship failed with status ${res.status}`);
    }

    const data = await res.json();
    if (!data.success || !data.sponsoredXdr) {
      throw new Error('Invalid response from sponsor API');
    }

    console.log(`[FeeBump] Successfully sponsored transaction using address ${data.sponsorAddress}`);
    return data.sponsoredXdr;
  } catch (error) {
    console.error('Fee bump error:', error);
    throw error;
  }
}

export function isFeeSponsorshipEnabled(): boolean {
  // Now toggled by whether the backend has a secret configured via the UI or explicitly true.
  // For demo validation, we assume true. If backend fails, soroban.ts catches and falls back cleanly.
  return true;
}
