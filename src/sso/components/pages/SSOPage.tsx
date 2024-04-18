import React, { useEffect, useMemo } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { stringToObject } from 'sso/utils';
import { RootState } from 'application/store';
import { setWalletData } from 'account/slice/accountSlice';
import { setKeyToApplicationStorage } from 'application/utils/localStorageUtils';
import { push } from 'connected-react-router';
import { RoutesEnum } from 'application/typings/routes';

type OwnProps = RouteComponentProps<{ data?: string }>;

const mapDispatchToProps = {
  setWalletData,
  routeTo: push,
};

const mapStateToProps = (state: RootState, props: OwnProps) => ({
  data: props.match.params.data,
});

const connector = connect(
  mapStateToProps,
  mapDispatchToProps,
);

type SSOProps = ConnectedProps<typeof connector>;

const SSOPageComponent: React.FC<SSOProps> = ({ setWalletData, routeTo, data }) => {
  const parsedData: {
    address?: string,
    returnUrl: string
  } = useMemo(() => (data ? stringToObject(data) : null), [data]);

  useEffect(() => {
    if (parsedData?.address) {
      setKeyToApplicationStorage('address', parsedData?.address);
      setWalletData({ address: parsedData?.address, logged: true });

      if (parsedData.returnUrl) {
        window.location.replace(parsedData.returnUrl);
      } else {
        routeTo(RoutesEnum.root);
      }
    }
  }, []);

  return (
    null
  );
};

export const SSOPage = connector(SSOPageComponent);
