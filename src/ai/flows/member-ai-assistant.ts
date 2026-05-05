'use server';
/**
 * BLMC AI Assistant — Improved with rich cooperative context,
 * conversation history, and structured responses.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// ── Types ──────────────────────────────────────────────────────────────────
const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const InputSchema = z.object({
  message: z.string().describe("The user's latest message."),
  history: z.array(MessageSchema).optional().describe('Previous conversation messages.'),
  memberName: z.string().optional().describe("The authenticated member's name."),
  memberSavings: z.number().optional().describe("The member's current savings balance in PHP."),
  memberDebt: z.number().optional().describe("The member's current debt balance in PHP."),
});

const OutputSchema = z.string().describe("The AI assistant's response.");

export type AIMessage = z.infer<typeof MessageSchema>;
export type AIAssistantInput = z.infer<typeof InputSchema>;

// ── Legacy simple function (for backward compatibility) ────────────────────
export async function memberAIAssistant(message: string): Promise<string> {
  return memberAIAssistantFlow({ message });
}

// ── Enhanced function with history and member context ──────────────────────
export async function memberAIAssistantWithContext(input: AIAssistantInput): Promise<string> {
  return memberAIAssistantFlow(input);
}

// ── System prompt ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are BLMC AI Assistant — a knowledgeable, friendly, and professional virtual assistant for the **Bansud Livestock Multi-Purpose Cooperative (BLMC)**, located in Poblacion, Bansud, Oriental Mindoro, Philippines.

## About BLMC
- CDA Registered Cooperative (Reg. No. 9520-04000617, CIN-0107040018, TIN No. 004-972-048-000)
- Founded in 2000, serving livestock raisers and farmers in Bansud, Oriental Mindoro
- Services: Loans, Supply & Feeds Program, Savings & Share Capital, Training & Seminars, Production Monitoring, Membership Benefits

## Your Role
You help members, applicants, and visitors with:
1. **Membership** — How to apply, requirements, process, fees (₱500 membership fee)
2. **Loans** — Types of loans, interest rates, requirements, application process
3. **Savings & Share Capital** — How to deposit, withdraw, check balance, patronage refunds (1% of annual purchases)
4. **Supply & Feeds Program** — Available products, how to purchase on credit, pricing
5. **Programs & Training** — Upcoming seminars, livestock management training
6. **General FAQs** — Office hours, contact info, cooperative rules

## BLMC Key Information
- **Membership Fee**: ₱500 one-time fee upon approval
- **Membership Types**: Regular and Associate
- **Share Capital**: Members commit to share capital contributions
- **Patronage Refund**: 1% of total annual purchases credited back to members
- **Loan Types**: Agricultural loans, livestock production loans, livelihood loans
- **Office**: Poblacion, Bansud, Oriental Mindoro
- **Goals**: Improve member livelihoods, promote proper marketing, protect against exploitative buyers, improve livestock breeds, ensure FDA-approved meat supply, provide livelihood

## Response Guidelines
- Be warm, helpful, and professional — like a cooperative staff member
- Use Filipino/English mix naturally when appropriate (e.g., "Magandang araw!")
- Format responses clearly with bullet points or numbered lists when listing steps
- Keep responses concise but complete — 2-4 sentences for simple questions, more for complex ones
- Always offer to help further at the end of your response
- Use ₱ for Philippine Peso amounts
- If asked about specific member data (balance, transactions), use the provided member context
- If you don't know something specific, direct them to contact the cooperative office

## Tone
Friendly, professional, helpful — like a knowledgeable cooperative staff member who genuinely cares about members' welfare.`;

// ── Flow ───────────────────────────────────────────────────────────────────
const memberAIAssistantFlow = ai.defineFlow(
  {
    name: 'memberAIAssistantFlow',
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async (input) => {
    // Build conversation context
    let conversationContext = '';

    if (input.memberName) {
      conversationContext += `\n## Current Member Context\n`;
      conversationContext += `- Member Name: ${input.memberName}\n`;
      if (input.memberSavings !== undefined) {
        conversationContext += `- Savings Balance: ₱${input.memberSavings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}\n`;
      }
      if (input.memberDebt !== undefined) {
        conversationContext += `- Debt Balance: ₱${input.memberDebt.toLocaleString('en-PH', { minimumFractionDigits: 2 })}\n`;
      }
    }

    // Build history string
    let historyContext = '';
    if (input.history && input.history.length > 0) {
      historyContext = '\n## Conversation History\n';
      input.history.slice(-6).forEach(msg => {
        historyContext += `${msg.role === 'user' ? 'Member' : 'Assistant'}: ${msg.content}\n`;
      });
    }

    const fullPrompt = `${SYSTEM_PROMPT}${conversationContext}${historyContext}

## Current Message
Member: ${input.message}


Respond as the BLMC AI Assistant:`;

    const { output } = await ai.generate({
      prompt: fullPrompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    });

    return output?.text ?? "I'm sorry, I couldn't process your request. Please try again or contact the cooperative office directly.";
  }
);
