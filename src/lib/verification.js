// src/lib/verification.js

// Function to generate a random 4-digit code
export function generateVerificationCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}
