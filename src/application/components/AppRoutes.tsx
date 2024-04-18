import React, { useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { FullScreenLoader } from 'common';

import { checkIfLoading } from 'network/selectors';

import { SSOPage } from 'sso/components/pages/SSOPage';

import { NFTsPage } from 'NFTs/components/pages/NFTs/NFTsPage';
import { AddOrEditNFTPage } from 'NFTs/components/pages/addNFT/AddOrEditNFTPage';
import { NFTPage } from 'NFTs/components/pages/NFT/NFTPage';
import { LogInPage } from 'login/components/pages/LogInPage';
import { EditProfilePage } from 'profiles/components/pages/editProfilePage/EditProfilePage';
import { ProfilesPage } from 'profiles/components/pages/profilesPage/ProfilesPage';
import { getIsModerator } from 'profiles/selectors/rolesSelectors';
import { PricingPage } from 'tariffs/components/pages/PricingPage';
import { initApplication } from '../slice/applicationSlice';
import { RoutesEnum } from '../typings/routes';
import { useAppDispatch, useAppSelector } from '../store';
import { AboutPage } from './pages/about/AboutPage';

const walletAddressRegExp = '[a-zA-Z]{2}[01-9]{18}';
const idAndSlugRegExp = '\\d+_.*';

const AppRoutesComponent: React.FC = () => {
  const dispatch = useAppDispatch();

  const isModerator = useAppSelector(getIsModerator);

  const networkApi = useAppSelector((state) => state.applicationData.networkApi);
  const loading = useAppSelector((state) => checkIfLoading(state, initApplication.type));

  useEffect(() => {
    if (!networkApi && !loading) dispatch(initApplication());
  }, []);

  if (!networkApi || loading) {
    return (
      <FullScreenLoader />
    );
  }

  return (
    <Switch>
      <Route path={`${RoutesEnum.sso}/:data`} component={SSOPage} />
      <Route exact path={RoutesEnum.login} component={LogInPage} />
      <Route
        exact
        path={`${RoutesEnum.editProfile}/:walletAddress(${walletAddressRegExp})?`}
        component={EditProfilePage}
      />
      <Route exact path={`${RoutesEnum.add}`} component={AddOrEditNFTPage} />
      <Route
        exact
        path={`/:walletAddress(${walletAddressRegExp})/:idAndSlug(${idAndSlugRegExp})${RoutesEnum.edit}`}
        component={AddOrEditNFTPage}
      />
      {isModerator && <Route exact path={`${RoutesEnum.authors}`} component={ProfilesPage} />}
      <Route
        exact
        path={`/:walletAddress(${walletAddressRegExp})`}
        render={(props) => <NFTsPage isDraft isMyNftsPage {...props} />}
      />
      <Route
        exact
        path={`${RoutesEnum.org}/:orgSlug`}
        render={(props) => <NFTsPage {...props} />}
      />
      {isModerator && <Route
        exact
        path={`${RoutesEnum.draft}`}
        render={(props) => <NFTsPage isDraft {...props} />}
      />}
      <Route
        exact
        path={`${RoutesEnum.pricing}`}
        component={PricingPage}
      />
      <Route
        exact
        path={`${RoutesEnum.about}`}
        component={AboutPage}
      />
      <Route
        exact
        path={`/:walletAddress(${walletAddressRegExp})/:draft?/:idAndSlug(${idAndSlugRegExp})`}
        component={NFTPage}
      />
      <Route exact path={RoutesEnum.root} component={NFTsPage} />
      <Redirect path="*" to={RoutesEnum.root} />
    </Switch>
  );
};

export const AppRoutes = AppRoutesComponent;
