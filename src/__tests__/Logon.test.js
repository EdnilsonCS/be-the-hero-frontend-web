import React from 'react';
import { render, fireEvent, act, cleanup } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { MemoryRouter } from 'react-router-dom';
import api from '../services/api';
import Logon from '../pages/Logon';

const apiMock = new MockAdapter(api);

const wait = (amount = 0) => {
  return new Promise((resolve) => setTimeout(resolve, amount));
};

const actWait = async (amount = 0) => {
  await act(async () => {
    await wait(amount);
  });
};

describe('@screen/logon', () => {
  beforeEach(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    localStorage.clear();
  });
  test('#should store on-site storage', async () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter>
        <Logon />
      </MemoryRouter>
    );
    const idInput = getByPlaceholderText(/sua id/i);
    fireEvent.change(idInput, { target: { value: '7f6b2e68' } });

    expect(idInput).toBeTruthy();
    expect(idInput.attributes.getNamedItem('value').value).toEqual('7f6b2e68');
    fireEvent.click(getByText(/entrar/i));

    await actWait();
    apiMock.onPost('/sessions').reply(200, {
      name: 'APAD',
    });
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  test('should edit the text field', async () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter>
        <Logon />
      </MemoryRouter>
    );

    const idInput = getByPlaceholderText(/sua id/i);

    expect(idInput).toBeTruthy();

    fireEvent.change(idInput, { target: { value: '7f6b2e68' } });
    expect(idInput.attributes.getNamedItem('value').value).toEqual('7f6b2e68');
  });

  test('should allow the user to login', async () => {
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <Logon />
      </MemoryRouter>
    );

    const idInput = getByPlaceholderText(/sua id/i);

    expect(idInput).toBeTruthy();

    fireEvent.change(idInput, { target: { value: '7f6b2e68' } });
    expect(idInput.attributes.getNamedItem('value').value).toEqual('7f6b2e68');

    fireEvent.click(getByText(/entrar/i));

    await actWait();
    apiMock.onPost('/sessions').reply(200, {
      name: 'APAD',
    });
  });
});
