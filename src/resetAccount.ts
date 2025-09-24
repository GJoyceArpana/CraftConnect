import { AdminUtils } from './firebase/adminUtils';

// Simple function to reset your test account
export const resetMyAccount = async () => {
  try {
    await AdminUtils.resetAllAccounts('9741577223');
    console.log('✅ Account reset successful! You can now sign up again.');
    alert('Account reset successful! You can now sign up again.');
  } catch (error) {
    console.error('❌ Reset failed:', error);
    alert('Reset failed. Check console for details.');
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  (window as any).resetMyAccount = resetMyAccount;
}
