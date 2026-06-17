import { callAI } from './aiOrchestrator';

export interface AgentStep {
  title: string;
  description: string;
  status: 'pending' | 'running' | 'done' | 'error';
}

export interface AgentResult {
  success: boolean;
  message: string;
  refundAmount?: number;
  steps: AgentStep[];
}

function runSteps(steps: AgentStep[], delayMin: number, delayMax: number): Promise<AgentStep[]> {
  return new Promise((resolve) => {
    let i = 0;
    function next() {
      if (i > 0) steps[i - 1].status = 'done';
      if (i < steps.length) {
        steps[i].status = 'running';
        i++;
        setTimeout(next, delayMin + Math.random() * (delayMax - delayMin));
      } else {
        resolve(steps);
      }
    }
    next();
  });
}

export async function simulateCancellation(subscriptionName: string): Promise<AgentResult> {
  const steps: AgentStep[] = [
    { title: 'Opening app/website', description: `Navigating to ${subscriptionName} account settings...`, status: 'pending' },
    { title: 'Finding cancellation flow', description: 'Bypassing retention offers and dark patterns...', status: 'pending' },
    { title: 'Submitting request', description: 'Filling cancellation form with account details...', status: 'pending' },
    { title: 'Confirming cancellation', description: 'Capturing confirmation email and reference ID...', status: 'pending' },
  ];

  const completedSteps = await runSteps(steps, 1000, 1800);

  let message = `${subscriptionName} has been successfully cancelled. You'll receive a confirmation shortly.`;
  try {
    const result = await callAI(
      `Write one friendly sentence confirming cancellation of ${subscriptionName} subscription and what the user should expect next.`,
      { mode: 'cost-aware' }
    );
    message = result.text;
  } catch {
    // keep default
  }

  return {
    success: true,
    message,
    refundAmount: 0,
    steps: completedSteps,
  };
}

export async function simulateNegotiation(subscriptionName: string): Promise<AgentResult> {
  const steps: AgentStep[] = [
    { title: 'Analyzing usage pattern', description: `Reviewing 90-day usage for ${subscriptionName}...`, status: 'pending' },
    { title: 'Fetching competitor pricing', description: 'Comparing plans across market...', status: 'pending' },
    { title: 'Initiating live chat', description: 'Connecting to retention agent...', status: 'pending' },
    { title: 'Presenting case', description: 'Requesting 50% discount or pause option...', status: 'pending' },
  ];

  const completedSteps = await runSteps(steps, 800, 1400);
  const success = Math.random() > 0.3;

  let message = success
    ? `${subscriptionName} offered a 3-month pause instead of cancellation. Accepted!`
    : `${subscriptionName} refused to negotiate. Cancellation is your best option.`;

  try {
    const result = await callAI(
      `Write one sentence summarizing the negotiation outcome for ${subscriptionName}. Success: ${success}.`,
      { mode: 'cost-aware' }
    );
    message = result.text;
  } catch {
    // keep default
  }

  return {
    success,
    message,
    refundAmount: success ? 0 : undefined,
    steps: completedSteps,
  };
}
