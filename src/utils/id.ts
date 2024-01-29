export const rhoIdGenerator = () =>
  ("rho" +
    Date.now().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)) as `rho_${string}`;
