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

export async function simulateCancellation(subscriptionName: string): Promise<AgentResult> {
  const steps: AgentStep[] = [
    { title: 'Opening app/website', description: `Navigating to ${subscriptionName} account settings...`, status: 'pending' },
    { title: 'Finding cancellation flow', description: 'Bypassing retention offers and dark patterns...', status: 'pending' },
    { title: 'Submitting request', description: 'Filling cancellation form with account details...', status: 'pending' },
    { title: 'Confirming cancellation', description: 'Capturing confirmation email and reference ID...', status: 'pending' },
  ];

  return new Promise((resolve) => {
    let i = 0;
    function next() {
      if (i > 0) steps[i - 1].status = 'done';
      if (i < steps.length) {
        steps[i].status = 'running';
        i++;
        setTimeout(next, 1200 + Math.random() * 800);
      } else {
        resolve({
          success: true,
          message: `${subscriptionName} has been successfully cancelled. You'll receive a confirmation shortly.`,
          refundAmount: 0,
          steps,
        });
      }
    }
    next();
  });
}

export async function simulateNegotiation(subscriptionName: string): Promise<AgentResult> {
  const steps: AgentStep[] = [
    { title: 'Analyzing usage pattern', description: `Reviewing 90-day usage for ${subscriptionName}...`, status: 'pending' },
    { title: 'Fetching competitor pricing', description: 'Comparing plans across market...', status: 'pending' },
    { title: 'Initiating live chat', description: 'Connecting to retention agent...', status: 'pending' },
    { title: 'Presenting case', description: 'Requesting 50% discount or pause option...', status: 'pending' },
  ];

  return new Promise((resolve) => {
    let i = 0;
    function next() {
      if (i > 0) steps[i - 1].status = 'done';
      if (i < steps.length) {
        steps[i].status = 'running';
        i++;
        setTimeout(next, 1000 + Math.random() * 600);
      } else {
        const success = Math.random() > 0.3;
        resolve({
          success,
          message: success
            ? `${subscriptionName} offered a 3-month pause instead of cancellation. Accepted!`
            : `${subscriptionName} refused to negotiate. Cancellation is your best option.`,
          refundAmount: success ? 0 : undefined,
          steps,
        });
      }
    }
    next();
  });
}
