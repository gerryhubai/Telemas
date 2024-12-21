export async function sendTransaction(transaction: { to: string; value: number; message: string }, tonConnectUI: any) {
  if (!tonConnectUI.wallet) {
    throw new Error('Wallet is not connected');
  }

  const payload = {
    messages: [
      {
        address: transaction.to,
        amount: transaction.value * 10 ** 9, // Convert TON to nanoTON
        payload: transaction.message,
      },
    ],
  };

  await tonConnectUI.wallet.sendTransaction(payload);
}
