import Redlock from 'redlock';

export function buildRedlock(connection) {
  return new Redlock([connection], {
    driftFactor: 0.01,
    retryCount: 10,
    retryDelay: 200,
    retryJitter: 200,
  });
}
