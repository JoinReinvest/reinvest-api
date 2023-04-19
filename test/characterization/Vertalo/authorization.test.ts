import axios from 'axios';
import { expect } from 'chai';

import { VERTALO_CONFIG } from '../../config';
import expectThrowsAsync from '../expectThrowsAsync';
import VertaloRequester from './VertaloRequester';

const { CLIENT_ID, CLIENT_SECRET, API_URL } = VERTALO_CONFIG;

context('Given I am a developer', () => {
  describe('When I provide wrong credentials', async () => {
    it('Then Vertalo should return failed response', async () => {
      await expectThrowsAsync(
        () => axios.get('https://sandbox.vertalo.com/authenticate/token/login?client_id=client_id&client_secret=secret'),
        'Request failed with status code 403',
      );
    });
  });

  describe('When I provide valid credentials', async () => {
    const vertaloRequester: VertaloRequester = new VertaloRequester(CLIENT_ID, CLIENT_SECRET, API_URL);
    it('Then Vertalo should return valid token', async () => {
      const token = await vertaloRequester.preAuthorize();
      expect(token).to.be.a('string').not.empty;
    });
  });
});
