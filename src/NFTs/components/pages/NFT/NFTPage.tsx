import {
  FullScreenLoader,
  Layout,
  IconButton,
  OutlinedInput,
  Button,
  Jdenticon,
} from 'common';

import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';

import slugify from 'slugify';

import {
  BackIcon,
  CategoryIcon,
  ChevronIcon,
  ClockIcon,
  ClockThreeIcon,
  CubeIcon,
  MarkerIcon,
  SortIcon,
  UserIcon,
} from 'assets/icons';
import { RootState } from 'application/store';
import { ConnectedProps, connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import {
  getNFT,
  getNFTById,
} from 'NFTs/selectors/NFTsSelectors';
import {
  approveOrRejectNFTTrigger,
  loadNFTTrigger,
} from 'NFTs/slice/NFTsSlice';
import { checkIfLoading } from 'network/selectors';
import { RoutesEnum } from 'application/typings/routes';

import { useTranslation } from 'react-i18next';
import { getMessages } from 'messages/selectors/messagesSelectors';
import { format } from 'date-fns';
import * as yup from 'yup';
import { FormikHelpers, useFormik } from 'formik';
import {
  postMessageTrigger,
  loadMessagesTrigger,
} from 'messages/slice/messagesSlice';
import { Divider, IconButton as MUIIconButton, Skeleton } from '@mui/material';
import { Link } from 'react-router-dom';
import { reverse, xor } from 'lodash';
import createHash from 'create-hash';
import cn from 'classnames';
import { getLoadDataUrl } from 'api/openResty';
import {
  getIsGeneralEditor,
  getIsModerator,
  getIsVerified,
} from 'profiles/selectors/rolesSelectors';
import { getWalletAddress } from 'account/selectors/accountSelectors';
import { daos } from 'application/constants';
import hooks from 'hooks';
import styles from './NFTPage.module.scss';
import { publishNFTTrigger } from '../../../slice/NFTsSlice';

type OwnProps = RouteComponentProps<{ idAndSlug?: string; draft?: string }>;

const mapDispatchToProps = {
  loadNFTTrigger,
  loadMessagesTrigger,
  postMessageTrigger,
  approveOrRejectNFTTrigger,
  publishNFTTrigger,
};

const mapStateToProps = (state: RootState, props: OwnProps) => {
  const id = props?.match?.params?.idAndSlug?.match(/^\d+/)?.[0];
  const isDraft = !!props?.match?.params?.draft;
  return {
    NFT: getNFTById(state, id!) || getNFT(state),
    id,
    isNFTLoading: checkIfLoading(state, loadNFTTrigger.type),
    isLoadMessagesLoading: checkIfLoading(state, loadMessagesTrigger.type),
    isPostMessageLoading: checkIfLoading(state, postMessageTrigger.type),
    isPublishNFTLoading: checkIfLoading(state, publishNFTTrigger.type),
    messages: getMessages(state),
    isModerator: getIsModerator(state),
    isAuthor: getIsVerified(state),
    isUserGeneralEditor: getIsGeneralEditor(state),
    walletAddress: getWalletAddress(state),
    isDraft,
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type NFTPageComponentProps = ConnectedProps<typeof connector>;

const initialValues = {
  message: '',
};

type InitialValues = typeof initialValues;

const NFTPageComponent: React.FC<NFTPageComponentProps> = ({
  id,
  loadNFTTrigger,
  NFT,
  messages,
  isNFTLoading,
  isLoadMessagesLoading,
  isPostMessageLoading,
  loadMessagesTrigger,
  postMessageTrigger,
  isModerator,
  isUserGeneralEditor,
  walletAddress,
  approveOrRejectNFTTrigger,
  publishNFTTrigger,
  isPublishNFTLoading,
  isDraft,
  isAuthor,
}) => {
  const [isReversed, setIsReversed] = useState(false);
  const [openedMessages, setOpenedMessages] = useState<string[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      loadNFTTrigger({ id, isDraft });
    }
    if (id) {
      loadMessagesTrigger({ NFTID: +id });
    }
  }, [id, isDraft, loadNFTTrigger, loadMessagesTrigger]);

  const nameOfDAO = useMemo(
    () => daos?.find(
      ({ slug }) => slug === NFT?.nameOfDAOSlug,
    )?.name,
    [NFT?.nameOfDAOSlug],
  );

  const validationSchema = yup.object({
    message: yup
      .string()
      .required(t('requiredField'))
      .max(560, t('exceededNumberOfCharacters')),
  });

  const handleSubmit = async (
    { message }: InitialValues,
    formikHelpers: FormikHelpers<InitialValues>,
  ) => {
    if (message) {
      postMessageTrigger({
        NFTID: NFT!.id,
        message,
        additionalActionOnSuccess: () => {
          formikHelpers.resetForm();
          if (id) {
            loadMessagesTrigger({ NFTID: +id });
          }
        },
      });
    }
  };

  const formik = useFormik({
    initialValues,
    onSubmit: handleSubmit,
    validationSchema,
  });

  const imgUrl = useMemo(() => {
    const link = isDraft
      ? `${getLoadDataUrl(NFT?.id.toString())}/${NFT?.imageHash}`
      : `${getLoadDataUrl(NFT?.originTokenId?.toString())}/${NFT?.imageHash}`;
    return link;
  }, [NFT?.id, NFT?.imageHash, NFT?.originTokenId, isDraft]);

  const renderForm = () => {
    const messageLength = formik.values.message.length;
    return (
      <form onSubmit={formik.handleSubmit}>
        <div className={styles.formContent}>
          <OutlinedInput
            id="message"
            name="message"
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
            type="submit"
            color="secondary"
            className={styles.submitButton}
          >
            <ChevronIcon />
          </IconButton>
        </div>
        <div
          className={cn(styles.inputTextLength, {
            [styles.inputTextLength__error]: messageLength > 560,
          })}
        >
          {`${messageLength} / 560`}
        </div>
      </form>
    );
  };
  const NFTLink = hooks.useFormattedNFTLink({ NFT, isDraft, isShowSecondLink: true });

  const renderBasicInfo = useCallback(() => {
    const formattedDate =
      NFT ?
        format(NFT?.publishedAt || NFT.createdAt, 'dd.MM.yyyy') : '-';
    const isShowLink = !!((isModerator || (NFT?.walletAddress === walletAddress && isAuthor)) && (NFT?.publishedTokenId || NFT?.originTokenId));
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
          to={`${RoutesEnum.org}/${NFT?.nameOfDAOSlug}`}
        >
          {nameOfDAO}
        </Link>

        <CategoryIcon />
        <div>{NFT?.category ? t(NFT.category) : NFT?.category}</div>

        <ClockIcon />
        <div>{formattedDate}</div>

        {isShowLink && <>
          <ClockThreeIcon />
          <div>
            {isDraft ? t('publicationLink') : t('draftLink')}
            <br />
            <Link className={styles.NFTLink} to={NFTLink.short}>
              {NFTLink.full}
            </Link>
          </div>
        </>}
      </div>
    );
  }, [NFT, NFTLink, isAuthor, isDraft, isModerator, nameOfDAO, t, walletAddress]);

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
                <Jdenticon size="36" value={hashedValue} />
                <div>
                  <div className={styles.messageWalletAddress}>
                    {message.walletAddress}
                  </div>
                </div>
              </div>

              <div
                onClick={() => setOpenedMessages(xor(openedMessages, [key]))}
                className={cn(styles.messageText, {
                  [styles.messageText__closed]: !openedMessages.includes(key),
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
    [JSON.stringify(sortedMessages), t, openedMessages],
  );

  const handleClickSortButton = () => {
    setIsReversed(!isReversed);
  };

  const handleClickApproveButton = () => {
    if (id) {
      approveOrRejectNFTTrigger({ id: +id, isApproved: true });
    }
  };

  const handleClickRejectButton = () => {
    if (id) {
      approveOrRejectNFTTrigger({ id: +id, isApproved: false });
    }
  };

  const handleClickPublishButton = () => {
    if (id) {
      publishNFTTrigger({ id: +id });
    }
  };

  const renderButtons = useCallback(() => {
    const sluggedTheme = NFT && slugify(NFT.theme);
    const isShowEditButtonMobile = (isModerator || (NFT?.walletAddress === walletAddress && isAuthor));
    const isShowPublishButton = isUserGeneralEditor && !(!NFT?.isApproved || NFT?.isRejected || !isDraft);
    const isShowApproveAndRejectButton = isModerator && (!NFT?.isApproved && !NFT?.isRejected);
    return (
      <div className={styles.buttons}>
        {isShowEditButtonMobile && (
          <Button
            variant="contained"
            size="extraSmall"
            to={`/${NFT?.walletAddress}/${id}_${sluggedTheme}${RoutesEnum.edit}`}
          >
            {t('edit')}
          </Button>
        )}
        {isShowPublishButton && (
          <Button
            onClick={handleClickPublishButton}
            variant="contained"
            loading={isPublishNFTLoading}
            size="extraSmall"
          >
            {t('publish')}
          </Button>
        )}
        {isShowApproveAndRejectButton && (
          <Button
            onClick={handleClickApproveButton}
            variant="contained"
            size="extraSmall"
          >
            {t(NFT?.isApproved ? 'NFTApproved' : 'accept')}
          </Button>
        )}
        {isShowApproveAndRejectButton && (
          <Button
            onClick={handleClickRejectButton}
            variant="contained"
            size="extraSmall"
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
    isPublishNFTLoading,
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
            background: '#ffffff1a',
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
    isAuthor,
  ]);

  if (isNFTLoading) {
    return <FullScreenLoader />;
  }

  return (
    <Layout contentClassName={styles.layoutContent}>
      <div className={styles.wrapper}>
        <div className={styles.controls}>
          <Link to={RoutesEnum.root} className={styles.backLink}>
            <BackIcon />
            {' '}
            {t('back')}
          </Link>
          {renderButtons()}
        </div>
        <div className={styles.content}>
          <div className={styles.title}>{NFT?.theme}</div>
          {renderBasicInfo()}
          {id && <img className={styles.image} src={imgUrl} alt="" />}
          {renderMessagesBlock()}
        </div>
      </div>
    </Layout>
  );
};

export const NFTPage = connector(NFTPageComponent);
