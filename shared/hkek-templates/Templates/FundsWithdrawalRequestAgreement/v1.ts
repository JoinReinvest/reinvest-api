/* eslint-disable typescript-sort-keys/interface */
import { TemplateContentType, TemplateStructureType } from "Templates/Types";

export interface FundsWithdrawalRequestAgreementContentFieldsV1 extends TemplateContentType {
  date: string;
  authorizedOfficer: string;
  sharesOwnerName: string;
  isCompany: boolean;
  email: string;
  phoneNumber: string;
  fundSeriesName: string;
  address: string;
  shareCount: number;
  withdrawalAmount: string;
  ipAddress: string;
  signingTimestamp: string;
  signingDate: string;
}

/**
 * @description
 * 1. {{}} - Content in double curly brackets will be bolded
 * 2. {(name)} - Content in parentheses will be replaced with the value of the field
 * 3. Fields required by the template are defined in the type SubscriptionAgreementContentFieldsV1 above
 */
export const fundsWithdrawalRequestAgreementTemplateV1: TemplateStructureType = [
  {
    header: 'SHARE REDEMPTION AGREEMENT',

    paragraphs: [
      {
        lines: [
          // @ts-ignore
          (content: FundsWithdrawalRequestAgreementContentFieldsV1) =>
            `{{THIS STOCK REDEMPTION AGREEMENT}} (“{{Agreement}}”) is dated as of {(date)}, by and among REINVEST Community${
              content.isCompany ? ', a ' + content.sharesOwnerName + ' (“{{Corporation}}”)' : ''
            } and {(authorizedOfficer)} (“Individual/Entity”). The Corporation and Shareholders are sometimes collectively referred to herein as the “{{Parties}}” and individually as a “{{Party}}”.`,
        ],
      },
    ],
  },
  {
    header: 'RECITALS',
    paragraphs: [
      {
        lines: [
          '{{WHEREAS}}, {(sharesOwnerName)} the record owners of approximately {(shareCount)} of the issued and outstanding common stock of the {(fundSeriesName)} (“{{Shares}}”);',
        ],
      },
      {
        lines: ['{{WHEREAS}}, the shareholder accepts REINVEST Community to withdraw shares and corresponding requested funds on their behalf;'],
      },
      {
        lines: [
          '{{WHEREAS}}, the Corporation desires to redeem all of the Shares currently owned by the Shareholders (the “{{Redeemed Shares}}”), and the Shareholders desire to transfer, sell and assign the Redeemed Shares to the Corporation, pursuant to the terms of this Agreement.',
        ],
      },
      {
        lines: [
          '{{NOW, THEREFORE}}, in consideration of the foregoing premises, the mutual covenants and conditions contained herein, and for other good and valuable consideration, the receipt and sufficiency of which is hereby acknowledged, the Parties hereby agree as follows:',
        ],
      },
      {
        lines: [
          '1. {{Redemption of Shares}}. On and subject to the terms and conditions of this Agreement, the Shareholders agree, separately and not jointly, to transfer, sell, assign and deliver the Redeemed Shares to the Corporation, free and clear of any and all liens, claims, pledges, equities, security interests, options,\n' +
            'restrictions and encumbrances and other rights of any person or entity of any kind, nature or description whatsoever in exchange for the Redemption Price (as defined below).',
        ],
      },
      {
        lines: [
          '2. {{Redemption Price and Payment}}. The Corporation shall pay the Shareholders a redemption price for the Redeemed Shares in the aggregate amount of {(withdrawalAmount)} (the “{{Redemption Price}}”).\n' +
            'The Redemption Price shall be allocated between the Shareholders in accordance with the amount reflecting against each of their names in the allocation table attached hereto as Exhibit A. The Shareholders and the Corporation acknowledge and agree that the Redemption Price has been derived by mutual agreement of the Parties. At the Closing the Corporation\n' +
            'shall pay to each of the Shareholders the Redemption Price in full in accordance with the respective amounts set forth against each Shareholder in Exhibit A. Payment of the Redemption Price shall be made by the Corporation to the Shareholders in cash by wire transfer of immediately available funds to an account designated in advance by the Shareholders.',
        ],
      },
      {
        lines: [
          '3. {{Closing Conditions}}. The Parties’ obligation to consummate the transactions contemplated hereunder is subject to the satisfaction of the following conditions:',
          '(a) Each of the Shareholders shall, separately and not jointly, deliver to the Corporation',
          '(i) an executed copy of the Assignment of Redeemed Shares, attached hereto as Exhibit B, representing the transfer of the Redeemed Shares; and (ii) any and all certificates representing the Redeemed Shares, duly endorsed by each Shareholder to the Corporation.',
          '(b) Each of the Parties shall have delivered to the other originals of this Agreement executed by each of them.',
          '(c) The Corporation shall deliver to the Shareholders a consent of the Directors of the Corporation authorizing the Corporation’s execution of and performance of its obligations under this Agreement.',
          '(e) The Corporation shall confirm to the Shareholders that the Corporation has closed a private placement of the Corporation’s securities in which the Corporation received proceeds in an amount exceeding the Redemption Price.',
        ],
      },
      {
        lines: [
          '4. {{The Closing}}. The closing of the redemption and purchase of the Redeemed Shares described in this Agreement (the “{{Closing}}”) will take place through the electronic exchange of documents, and payments.\n' +
            'The Closing Documents, fully executed by all Parties, shall be released by verbal confirmation of the Parties upon the satisfaction of the conditions set forth in Section 3.',
        ],
      },
      {
        lines: [
          '5. {{Representations and Warranties}}.',
          '(a) Representations and Warranties of the Corporation. The Corporation hereby represents and warrants to the Shareholders as follows:',
          '(i) The Corporation has the full right, power and authority to enter into and perform the terms of this Agreement and to consummate the transactions described in and contemplated by this Agreement and that this Agreement and the transactions contemplated herein have been duly authorized by the Corporation;',
          '(ii) This Agreement constitutes a legal, valid and binding obligation of the Corporation which is enforceable against the Corporation in accordance with its terms, except as enforcement may be limited by applicable bankruptcy, insolvency, reorganization, moratorium or similar laws relating to or limiting creditor’s rights generally and subject to the availability of equitable remedies;',
          '(iii) Neither the execution and delivery of this Agreement, nor the fulfillment of the terms and conditions of this Agreement, constitute or will constitute a default under, conflict or are, or will be, inconsistent with or result in the termination of any contract, agreement, covenant or other instrument to which the Corporation is a party; and',
          '(iv) The Corporation is not a party to, nor has he been threatened with, any legal or equitable action or proceeding before any court, arbitration, administrative agency or other tribunal which might adversely affect the Corporation’s ability to consummate the transactions described in and contemplated by this Agreement, nor is there any judgment, award, decree, lien or order pending or threatened action against the Corporation that would adversely affect the Corporation’s ability to consummate the transactions described in and contemplated by this Agreement.',
        ],
      },
    ],
  },
  {
    header: '-2-',
    paragraphs: [
      {
        lines: [
          '(b) {{Representations and Warranties of the Shareholders}}. Each of the Shareholders hereby represents and warrants to the Corporation as follows:',
          '(i) The Shareholder is the legal and record owner of the Redeemed Shares, and has full unrestricted power and authority to transfer and sell the Redeemed Shares to the Corporation, in the manner provided for in this Agreement;',
          '(ii) The Redeemed Shares represent the entire equity interest of the Shareholder in the Corporation and, upon consummation of the transaction contemplated herein, the Shareholder shall hereinafter own no Shares in the Corporation and shall have no rights associated with being a Shareholder whatsoever;',
          '(iii) The Shareholder is not the holder, beneficially or of record, of any right or option to acquire additional Shares in the Corporation, whether by warrant, option or otherwise;',
          '(iv) The Shareholder is transferring good and marketable title in the Redeemed Shares free and clear of any and all liens, claims, pledges, equities, security interests, options, restrictions and encumbrances and any other rights of any person or entity of any kind, nature or description whatsoever;',
          '(v) This Agreement constitutes a legal, valid and binding obligation of the Shareholder which is enforceable against the Shareholder in accordance with its terms, except as enforcement may be limited by applicable bankruptcy, insolvency, reorganization, moratorium or similar laws relating to or limiting creditor’s rights generally and subject to the availability of equitable remedies;',
          '(vi) Neither the execution and delivery of this Agreement, nor the fulfillment of the terms and conditions of this Agreement, constitute or will constitute a default under, conflict or are, or will be, inconsistent with or result in the termination of any contract, agreement, covenant or other instrument to which the Shareholder is a party, or which to the actual knowledge of the Shareholder, would have a material adverse effect on the Corporation; and',
          '(vii) The Shareholder is not a party to, nor has been threatened with, any legal or equitable action or proceeding before any court, arbitration, administrative agency or other tribunal which might adversely affect the Shareholder’s ability to consummate the transactions described in and contemplated by this Agreement, nor is there any judgment, award, decree, lien or order pending or threatened action against the Shareholder or the Shares that would adversely affect the Shareholder’s ability to consummate the transactions described in and contemplated by this Agreement.',
        ],
      },
      {
        lines: [
          '6. {{Indemnification}}. Each Party hereby agrees to indemnify and hold the other Party and its respective officers, directors, managers, members, employees, agents, heirs, executors, personal representatives, successors and assigns, harmless from and against any and all loss, cost, damage,\n' +
            'liability and expense (including, without limitation, reasonable attorneys’ fees) which such indemnified party may suffer, sustain or incur as a result of, in connection with, arising out of, or resulting from such indemnifying party’s breach of any of its obligations,\n' +
            'representations or warranties hereunder. Further, Corporation shall defend and hold Shareholder harmless, from any third party claims arising from this Agreement or the transactions contemplated hereby.',
        ],
      },
      {
        lines: [
          '7. {{Release}}.',
          '(a) Except as limited below and as set forth herein regarding defaults in the Parties’ obligations under this Agreement, which shall not be released hereby, upon the Closing of the transactions contemplated by this Agreement (including receipt of all sums payable to\n' +
            'Shareholders hereunder) each Shareholder releases and forever discharges the Corporation, and each other director, officer and shareholder of the Corporation, and their successors, assigns, heirs, officers, employees and agents (collectively, the “{{Corporation Released Parties}}”)\n' +
            'from and against all debts, actions, causes of action, suits, contracts, agreements, damages and any and all claims, demands and liabilities whatsoever of every kind or nature (all hereinafter collectively referred to as “{{Claims}}”) which any one or both of the Shareholders has or may have, \n' +
            'or ever had against the Corporation Released Parties, and whether known or unknown, contingent or otherwise, relating to either (i) Shareholder’s capacity as a shareholder of the Corporation, (ii) the fairness and the adequacy of the consideration received or to be received under this Agreement,\n' +
            '(iii) any claim or future claim of pre-emptive rights or dividend distributions under the Certificate of Incorporation of the Corporation and (iv) any contractual relationship between the Corporation and a Shareholder or an affiliate of a Shareholder that is expressly terminated pursuant to this Agreement.\n' +
            'This release shall not apply to Claims arising from (A) any contractual relationship between the Corporation and a Shareholder or an affiliate of a Shareholder that is not terminated pursuant to this Agreement, (B) actions intentionally taken by the Corporation Released Parties constituting fraud, or (C) gross negligence of a material nature.',
        ],
      },
    ],
  },
  {
    header: '-3-',
    paragraphs: [
      {
        lines: [
          '(b) Except as limited below and as set forth herein regarding defaults in the Parties’ obligations under this Agreement, which shall not be released hereby, the Corporation releases and forever discharges each of the Shareholders and each of their respective officers, trustees, employees, agents, and beneficiaries,\n' +
            'as appropriate, and their successors, assigns, and heirs (collectively, the “{{Shareholder Released Parties}}”), from and against all Claims which the Corporation has or may have, or ever had against the Shareholder Released Parties, and whether known or unknown, contingent or otherwise, including, without limitation, all Claims relating\n' +
            'to the operation of the Corporation and its affiliates, any claim arising out of the relationship of any one or more of the Parties prior to the Closing, or any related matters. This release shall not apply to Claims arising from (i) actions intentionally taken by any Shareholder Released Party constituting fraud, or (ii) gross negligence of a material nature.',
        ],
      },
      {
        lines: [
          '8. {{Miscellaneous}}',
          '(a) {{Survival}}. The Parties’ respective representations, warranties, covenants and agreements contained in this Agreement will survive the execution of this Agreement. In addition, those terms and conditions of this Agreement that by their nature should survive this Agreement shall so survive.',
          '(b) {{Notices}}. All notices and other communications required or desired to be given pursuant to this Agreement will be given in writing and will be deemed received by the addressee upon personal delivery, or on the third day after mailing if sent by registered or certified mail, postage prepaid, return receipt requested, or on the day after sending if sent by a nationally recognized overnight delivery service which maintains records of the time, place and recipient of delivery or by email or fax (with confirmation of transmission), and in each case if addressed as follows:',
        ],
      },
      {
        lines: ['{{If to the Corporation: North Capital}}', '{{North Capital address}}', 'Attn: Finance dept', 'Tel.: (954) 596-1000', 'Email: {{***@***}}'],
      },
      {
        lines: [
          '{{With a copy to: Vertalo}}',
          '350 East Las Olas Blvd, Suite 1750',
          'Ft. Lauderdale FL 33301',
          'Tel.: (954) 991-5425',
          'Fax: (844) 670-6009',
          'Attn: Clint J. Gage',
          'Email: ***@***',
        ],
      },
      {
        lines: ['{{If to the Shareholder: {(sharesOwnerName)}}}', '{(address)}', 'Tel.: {(phoneNumber)}', 'Email: {(email)}'],
      },
      {
        lines: ['or to such other person, entity or address as a Party may designate in like manner, from time to time'],
      },
    ],
  },
  {
    header: '-4-',
    paragraphs: [
      {
        lines: [
          '(c) {{Binding Nature; Assignment}}. This Agreement is binding upon and will inure to the benefit of the Parties and their respective officers, directors, managers, shareholders, members, employees, agents, heirs, executors, administrators, personal representatives, successors and permitted assigns, if any.',
          '(d) {{Severability}}. If any provision contained herein is held to be invalid or unenforceable by a court of competent jurisdiction, such provision will be severed herefrom\n' +
            'and such invalidity or unenforceability will not affect any other provision of this Agreement, the balance of which will remain in and have its intended full force and effect; provided,\n' +
            'however, if such invalid or unenforceable provision may be modified so as to be valid and enforceable as a matter of law, Parties shall apply their best faith efforts to modify such provision\n' +
            'so as to be valid and enforceable to the maximum extent permitted by law.',
          '(e) {{Waiver}}. No waiver of any right or remedy any Party may have against the other(s) hereunder, at law, in equity or otherwise shall be effective unless in writing signed by the Party agreeing to such waiver.\n' +
            'A waiver by any Party hereto of any right or remedy on any one occasion shall not constitute a waiver of such right or remedy on any future occasion or of any other right or remedy such Party may have.',
          '(f) {{Incorporation}} of Recitals and Exhibits. The recitals set forth at the beginning of this Agreement are hereby incorporated into and made a part of this Agreement as if fully set forth in the body hereof.\n' +
            'The Exhibits referred to in this Agreement and attached hereto are made a part hereof and incorporated herein by this reference.',
          '(g) {{Governing Law; Jurisdiction}}. This Agreement will be governed by, construed in accordance with and interpreted under and consistent with the laws and decisions of the State of Florida, without regard to the choice\n' +
            'of law provisions thereof. The Parties irrevocably agree, and hereby consent and submit to the exclusive jurisdiction of the state and federal courts in Broward County, Florida, with regard to any actions or proceedings arising from,\n' +
            'relating to or in connection with the enforcement and/or interpretation of the provisions of this Agreement and the transactions contemplated herein.',
          '(h) {{Entire Agreement; Modifications}}. This Agreement, together with the Exhibits hereto, constitutes the entire agreement among the Parties with respect to the subject matter hereof and contemplated hereby, and supersedes all prior and\n' +
            'contemporaneous promises, communications and agreements, whether verbal or written, with respect thereto. This Agreement may not be changed, amended, modified, terminated or discharged, except by a writing signed by the Parties',
          '(i) {{Counterparts; Electronic Delivery}}. This Agreement may be executed in multiple counterparts each of which will be deemed an original, but all of which together will constitute one and the same instrument. Evidence of the execution of this\n' +
            'Agreement by any Party hereto may be by facsimile, email or other electronic transmitted to the other Parties. The Parties intend that electronically transmitted signatures shall have the same force and effect as original signatures.',
        ],
      },
    ],
  },
  { header: '[Signature Page Follows]', paragraphs: [] },
  {
    header: '-5- ',
    paragraphs: [
      {
        lines: ['{{IN WITNESS WHEREOF}}, the Parties have executed this Agreement as of the Effective Date.'],
      },
      {
        lines: ['{{CORPORATION:}} REINVEST Community.', 'By:', 'Name: Brandon Rule', 'Its: CEO'],
      },
      {
        lines: ['{{SHAREHOLDERS:}}', 'By:', 'Name: {(authorizedOfficer)}', 'Its: Authorized Officer'],
      },
    ],
  },
  {
    header: 'EXHIBIT A\nALLOCATION TABLE',
    paragraphs: [
      {
        lines: ['{{Shareholders}}:', '{(sharesOwnerName)}'],
      },
      {
        lines: ['{{Shares Redeemed}}:', '{(shareCount)}'],
      },
      {
        lines: ['{{Redemption Price Allocation}}.', '{(withdrawalAmount)}'],
      },
    ],
  },
  {
    header: 'EXHIBIT B\nASSIGNMENT OF SHARES',
    paragraphs: [
      {
        lines: [
          '{{FOR VALUE RECEIVED}}, {{{(authorizedOfficer)}}}, an entity, hereby sells, assigns and transfers to the REINVEST Community inc., a Delaware corporation (the “Corporation”),\n' +
            'for good and valuable consideration, [insert number of shares] of the Shares in the Corporation owned by [enter shareholder name] (the “Shares”), free and clear of any and all liens,\n' +
            'claims, equities, security interests and encumbrances whatsoever, and does hereby irrevocably constitute and appoint the Corporation attorney in fact to transfer said Shares on the books of the Corporation\n' +
            'with full power of substitution in the premises.',
        ],
      },
      { lines: ['Dated as of {(signingDate)}'] },
      {
        lines: [
          'By:',
          'Name: {(authorizedOfficer)}',
          'Its: Authorized Officer',
          // @ts-ignore
          (content: FundsWithdrawalRequestAgreementContentFieldsV1) =>
            content.ipAddress != '' ? 'Signature (IP,timestamp): {{{(ipAddress)},{(signingTimestamp)}}}' : 'Signature (IP,timestamp): ',
        ],
      },
    ],
  },
];
