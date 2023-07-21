import { ContainerInterface } from 'Container/Container';
import { PdfEvents } from 'HKEKTypes/Pdf';

import { WithdrawalDocumentPdfGeneratedEventHandler } from './EventHandler/WithdrawalDocumentPdfGeneratedEventHandler';

export type WithdrawalsTechnicalHandlerType = {
  [PdfEvents.PdfGenerated]: () => WithdrawalDocumentPdfGeneratedEventHandler['handle'];
};

export const WithdrawalsTechnicalHandler = (container: ContainerInterface): WithdrawalsTechnicalHandlerType => ({
  [PdfEvents.PdfGenerated]: container.delegateTo(WithdrawalDocumentPdfGeneratedEventHandler, 'handle'),
});
