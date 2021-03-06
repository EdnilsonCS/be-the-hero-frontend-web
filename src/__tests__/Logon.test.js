import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { MemoryRouter, useHistory } from 'react-router-dom';
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

jest.mock('react-router-dom', () => {
  const historyObj = {
    push: jest.fn(),
  };

  return {
    ...jest.requireActual('react-router-dom'),
    useHistory: () => historyObj,
  };
});

describe('@screen/logon', () => {
  beforeEach(() => {
    jest.spyOn(window, 'alert').mockImplementation(() => { });
  });

  test('#should store on-site storage', async () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter>
        <Logon />
      </MemoryRouter>
    );

    apiMock.onPost('sessions').reply(200, {
      name: 'APAD',
    });

    await actWait();

    const idInput = getByPlaceholderText(/sua id/i);
    fireEvent.change(idInput, { target: { value: '7f6b2e68' } });

    expect(idInput).toBeTruthy();
    expect(idInput.attributes.getNamedItem('value').value).toEqual('7f6b2e68');
    fireEvent.click(getByText(/entrar/i));
    await actWait();

    expect(localStorage.setItem).toHaveBeenCalledTimes(2);
  });

  test('#should edit the text field', async () => {
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

  test('#should redirect to the profile screen', async () => {
    const { getByText } = render(
      <MemoryRouter>
        <Logon />
      </MemoryRouter>
    );

    const pushSpy = jest
      .spyOn(useHistory(), 'push')
      .mockImplementation()
      .mockClear();

    apiMock.onPost('sessions').reply(200, {
      name: 'APAD',
    });

    fireEvent.click(getByText(/entrar/i));
    await actWait();
    expect(pushSpy).toHaveBeenCalled();
    expect(pushSpy).toHaveBeenCalledTimes(1);
    expect(pushSpy).toHaveBeenCalledWith('/profile');
  });

  test('#should show mensagem with erro in logon', async () => {
    const { getByText } = render(
      <MemoryRouter>
        <Logon />
      </MemoryRouter>
    );

    apiMock.onPost('sessions').reply(400, {
      statusCode: 400,
      error: 'Bad Request',
      message: '"id" is not allowed to be empty',
      validation: {
        source: 'body',
        keys: ['id'],
      },
    });
    fireEvent.click(getByText(/entrar/i));
    await actWait();
    expect(window.alert).toBeCalledTimes(1);
    expect(window.alert).toHaveBeenCalledWith('Falha no login');
  });
});
