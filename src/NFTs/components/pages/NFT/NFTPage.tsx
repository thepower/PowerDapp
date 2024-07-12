import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Divider, Skeleton, IconButton as MUIIconButton } from '@mui/material';
import cn from 'classnames';
import createHash from 'create-hash';
import { format } from 'date-fns';
import { FormikHelpers, useFormik } from 'formik';
import { reverse, xor } from 'lodash';
import { useTranslation } from 'react-i18next';
import { ConnectedProps, connect } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import slugify from 'slugify';
import * as yup from 'yup';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { getLoadDataUrl } from 'api/openResty';
import { daos } from 'application/constants';
import { RootState } from 'application/store';
import { RoutesEnum } from 'application/typings/routes';
import {
  BackIcon,
  CategoryIcon,
  ChevronIcon,
  ClockIcon,
  ClockThreeIcon,
  CubeIcon,
  MarkerIcon,
  SortIcon,
  UserIcon
} from 'assets/icons';
import {
  FullScreenLoader,
  Layout,
  IconButton,
  OutlinedInput,
  Button,
  Jdenticon
} from 'common';
import hooks from 'hooks';
import { getMessages } from 'messages/selectors/messagesSelectors';
import { postMessage, loadMessages } from 'messages/thunks/messages';
import { checkIfLoading } from 'network/selectors';
import { getNFT } from 'NFTs/selectors/NFTsSelectors';
import { approveOrRejectNFT, publishNFT, loadNFT } from 'NFTs/thunks/NFTs';
import {
  getIsGeneralEditor,
  getIsModerator,
  getIsVerified
} from 'profiles/selectors/rolesSelectors';
import styles from './NFTPage.module.scss';

const mapDispatchToProps = {
  loadNFT,
  loadMessages,
  postMessage,
  approveOrRejectNFT,
  publishNFT
};

const mapStateToProps = (state: RootState) => {
  return {
    NFT: getNFT(state),
    isNFTLoading: checkIfLoading(state, loadNFT.typePrefix),
    isLoadMessagesLoading: checkIfLoading(state, loadMessages.typePrefix),
    isPostMessageLoading: checkIfLoading(state, postMessage.typePrefix),
    isPublishNFTLoading: checkIfLoading(state, publishNFT.typePrefix),
    messages: getMessages(state),
    isModerator: getIsModerator(state),
    isAuthor: getIsVerified(state),
    isUserGeneralEditor: getIsGeneralEditor(state),
    walletAddress: getWalletAddress(state)
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type NFTPageComponentProps = ConnectedProps<typeof connector>;

const initialValues = {
  message: ''
};

type InitialValues = typeof initialValues;

const NFTPageComponent: React.FC<NFTPageComponentProps> = ({
  loadNFT,
  NFT,
  messages,
  isNFTLoading,
  isLoadMessagesLoading,
  isPostMessageLoading,
  loadMessages,
  postMessage,
  isModerator,
  isUserGeneralEditor,
  walletAddress,
  approveOrRejectNFT,
  publishNFT,
  isPublishNFTLoading,
  isAuthor
}) => {
  const [isReversed, setIsReversed] = useState(false);
  const [openedMessages, setOpenedMessages] = useState<string[]>([]);
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { draft, idAndSlug } = useParams<{
    idAndSlug: string;
    draft?: string;
  }>();
  const id = idAndSlug?.match(/^\d+/)?.[0];
  const isDraft = !!draft;

  const NFTID = useMemo(
    () => (isDraft ? NFT?.id : NFT?.originTokenId),
    [NFT?.id, NFT?.originTokenId, isDraft]
  );

  useEffect(() => {
    if (id) {
      loadNFT({ id, isDraft, isSetNFT: true });
    }
    if (NFTID) {
      loadMessages(NFTID);
    }
  }, [id, isDraft, loadNFT, loadMessages, NFTID]);

  const nameOfDAO = useMemo(
    () => daos?.find(({ slug }) => slug === NFT?.nameOfDAOSlug)?.name,
    [NFT?.nameOfDAOSlug]
  );

  const validationSchema = yup.object({
    message: yup
      .string()
      .required(t('requiredField'))
      .max(560, t('exceededNumberOfCharacters'))
  });

  const handleSubmit = async (
    { message }: InitialValues,
    formikHelpers: FormikHelpers<InitialValues>
  ) => {
    if (message && NFTID) {
      postMessage({
        NFTID,
        message,
        additionalActionOnSuccess: () => {
          formikHelpers.resetForm();
          if (NFTID) {
            loadMessages(NFTID);
          }
        }
      });
    }
  };

  const formik = useFormik({
    initialValues,
    onSubmit: handleSubmit,
    validationSchema
  });

  const imgUrl = useMemo(() => {
    const link = `${getLoadDataUrl(NFTID?.toString())}/${NFT?.imageHash}`;

    return link;
  }, [NFT?.imageHash, NFTID]);

  const renderForm = () => {
    const messageLength = formik.values.message.length;
    return (
      <form onSubmit={formik.handleSubmit}>
        <div className={styles.formContent}>
          <OutlinedInput
            id='message'
            name='message'
            className={styles.formInput}
            fullWidth
            placeholder={t('messagePlaceholder')}
            multiline
            minRows={1}
            value={formik.values.message}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            errorMessage={formik.errors.message}
            error={formik.touched.message && Boolean(formik.errors.message)}
            disabled={isPostMessageLoading}
          />
          <IconButton
            type='submit'
            color='secondary'
            className={styles.submitButton}
          >
            <ChevronIcon />
          </IconButton>
        </div>
        <div
          className={cn(styles.inputTextLength, {
            [styles.inputTextLength__error]: messageLength > 560
          })}
        >
          {`${messageLength} / 560`}
        </div>
      </form>
    );
  };
  const NFTLink = hooks.useFormattedNFTLink({
    NFT,
    isDraft,
    isShowSecondLink: true
  });

  const renderBasicInfo = useCallback(() => {
    const formattedDate = NFT
      ? format(NFT?.publishedAt || NFT.createdAt, 'dd.MM.yyyy')
      : '-';
    const isShowLink = !!(
      (isModerator || (NFT?.walletAddress === walletAddress && isAuthor)) &&
      (NFT?.publishedTokenId || NFT?.originTokenId)
    );
    return (
      <div className={styles.basicInformation}>
        <UserIcon />
        <Link className={styles.link} to={`/${NFT?.walletAddress}`}>
          {`${NFT?.firstName} ${NFT?.lastName}`}
        </Link>

        <CubeIcon />
        <div>{NFT?.walletAddress}</div>

        <MarkerIcon />
        <Link
          className={styles.link}
          to={`${RoutesEnum.dao}/${NFT?.nameOfDAOSlug}`}
        >
          {nameOfDAO}
        </Link>

        <CategoryIcon />
        <div>{NFT?.category ? t(NFT.category) : NFT?.category}</div>

        <ClockIcon />
        <div>{formattedDate}</div>

        {isShowLink && (
          <>
            <ClockThreeIcon />
            <div>
              {isDraft ? t('publicationLink') : t('draftLink')}
              <br />
              <Link className={styles.NFTLink} to={NFTLink.short}>
                {NFTLink.full}
              </Link>
            </div>
          </>
        )}
      </div>
    );
  }, [
    NFT,
    NFTLink,
    isAuthor,
    isDraft,
    isModerator,
    nameOfDAO,
    t,
    walletAddress
  ]);

  const sortedMessages = isReversed ? reverse(messages.slice()) : messages;

  const renderMessages = useCallback(
    () => (
      <div className={styles.messages}>
        {sortedMessages.map((message) => {
          const hashedValue = createHash('sha256')
            .update(message.walletAddress)
            .digest()
            .toString('hex');
          const key = `${message.id}_${message.t}`;
          return (
            <div key={key} className={styles.message}>
              <div className={styles.firstRow}>
                <div className={styles.messageIcon} />
                <Jdenticon size='36' value={hashedValue} />
                <div>
                  <div className={styles.messageWalletAddress}>
                    {message.walletAddress}
                  </div>
                </div>
              </div>

              <div
                onClick={() => setOpenedMessages(xor(openedMessages, [key]))}
                className={cn(styles.messageText, {
                  [styles.messageText__closed]: !openedMessages.includes(key)
                })}
              >
                {message.v || '-'}
              </div>
              <div className={styles.messageDate}>
                {format(message.t, 'p dd / MMM / yyyy')}
              </div>
              <Divider className={styles.divider} />
            </div>
          );
        })}
      </div>
    ),
    [JSON.stringify(sortedMessages), t, openedMessages]
  );

  const handleClickSortButton = () => {
    setIsReversed(!isReversed);
  };

  const handleClickApproveButton = () => {
    if (id) {
      approveOrRejectNFT({ id: +id, isApproved: true });
    }
  };

  const handleClickRejectButton = () => {
    if (id) {
      approveOrRejectNFT({ id: +id, isApproved: false });
    }
  };

  const handleClickPublishButton = () => {
    if (id) {
      publishNFT({ id });
    }
  };

  const renderButtons = useCallback(() => {
    const sluggedTheme = NFT && slugify(NFT.theme);
    const isShowEditButtonMobile =
      isModerator || (NFT?.walletAddress === walletAddress && isAuthor);
    const isShowPublishButton =
      isUserGeneralEditor && !(!NFT?.isApproved || NFT?.isRejected || !isDraft);
    const isShowApproveAndRejectButton =
      isModerator && !NFT?.isApproved && !NFT?.isRejected;
    return (
      <div className={styles.buttons}>
        {isShowEditButtonMobile && (
          <Button
            variant='contained'
            size='extraSmall'
            onClick={() =>
              navigate(
                `/${NFT?.walletAddress}/${id}_${sluggedTheme}${RoutesEnum.edit}`
              )
            }
          >
            {t('edit')}
          </Button>
        )}
        {isShowPublishButton && (
          <Button
            onClick={handleClickPublishButton}
            variant='contained'
            loading={isPublishNFTLoading}
            size='extraSmall'
          >
            {t('publish')}
          </Button>
        )}
        {isShowApproveAndRejectButton && (
          <Button
            onClick={handleClickApproveButton}
            variant='contained'
            size='extraSmall'
          >
            {t(NFT?.isApproved ? 'NFTApproved' : 'accept')}
          </Button>
        )}
        {isShowApproveAndRejectButton && (
          <Button
            onClick={handleClickRejectButton}
            variant='contained'
            size='extraSmall'
          >
            {t(NFT?.isRejected ? 'NFTRejected' : 'reject')}
          </Button>
        )}
      </div>
    );
  }, [
    NFT,
    id,
    isDraft,
    isModerator,
    isUserGeneralEditor,
    t,
    isAuthor,
    walletAddress,
    isPublishNFTLoading
  ]);

  const renderMessagesBlock = useCallback(() => {
    if (!(isModerator || (NFT?.walletAddress === walletAddress && isAuthor))) {
      return null;
    }

    if (isLoadMessagesLoading) {
      return (
        <Skeleton
          height={500}
          width={'100%'}
          sx={{
            transform: 'none',
            transformOrigin: 'unset',
            borderRadius: '5px',
            background: '#ffffff1a'
          }}
        />
      );
    }

    return (
      <div className={styles.discussionAndTransactions}>
        <div className={styles.row}>
          <MUIIconButton
            disableRipple
            className={styles.controlBtn}
            onClick={handleClickSortButton}
          >
            <SortIcon transform={isReversed ? 'scale(1, -1)' : 'scale(1, 1)'} />
            <span>{isReversed ? t('firstOldOnes') : t('firstNewOnes')}</span>
          </MUIIconButton>
          <div className={styles.messagesCount}>
            {`${messages.length} ${t('comments')}`}
          </div>
        </div>
        {renderForm()}
        <Divider className={styles.divider} />
        {renderMessages()}
      </div>
    );
  }, [
    NFT?.walletAddress,
    isLoadMessagesLoading,
    isModerator,
    isReversed,
    messages.length,
    renderForm,
    renderMessages,
    t,
    walletAddress,
    isAuthor
  ]);

  if (isNFTLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Layout contentClassName={styles.layoutContent}>
      <div className={styles.wrapper}>
        <div className={styles.controls}>
          <Link to={RoutesEnum.root} className={styles.backLink}>
            <BackIcon /> {t('back')}
          </Link>
          {renderButtons()}
        </div>
        <div className={styles.content}>
          <div className={styles.title}>{NFT?.theme}</div>
          {renderBasicInfo()}
          {id && <img className={styles.image} src={imgUrl} alt='' />}
          <div className={styles.description}>{NFT?.description}</div>
          {renderMessagesBlock()}
        </div>
      </div>
    </Layout>
  );
};

export default connector(NFTPageComponent);
