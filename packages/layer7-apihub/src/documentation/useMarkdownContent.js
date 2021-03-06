import get from 'lodash/get';
import { useSelector } from 'react-redux';
import {
    CRUD_CREATE,
    CRUD_GET_ONE,
    CRUD_UPDATE,
    useCreate,
    useGetOne,
    useLocale,
    useNotify,
    useRefresh,
    useUpdate,
    useVersion,
} from 'ra-core';

import { documentationLocales } from '../i18n';
import { buildDocumentId } from '../dataProvider/documents';

/**
 * This hook is responsible for fetching the markdown content used in such
 * places as the homepage and application details.
 * It returns the markdown directly.
 *
 * @param {object} options
 * @param {string} options.entityType The document type
 * @param {string} options.entityUuid The uuid of the content type to retrieve
 * @param {string} options.navtitle The navtitle of the document
 *
 * @example
 * import { useMarkdownContent, MarkdownView } from 'layer7-apihub';
 *
 * export const HomePageContent = () => {
 *     const markdown = useMarkdownContent();
 *     return <MarkdownView value={markdown} />;
 * }
 */
export const useMarkdownContent = ({ entityType, entityUuid, navtitle }) => {
    const locale = useLocale();
    const notify = useNotify();
    const refresh = useRefresh();
    const version = useVersion();
    const id = buildDocumentId(
        entityType,
        entityUuid,
        navtitle,
        documentationLocales[locale]
    );

    const { data, loaded, loading, error } = useGetOne('documents', id, {
        action: CRUD_GET_ONE,
    });

    const [create] = useCreate('documents');
    const [update] = useUpdate('documents');

    const handleSave = markdown => {
        const options = {
            action: !!data ? CRUD_UPDATE : CRUD_CREATE,
            onSuccess: () => {
                notify(
                    'resources.documents.notifications.edit_success',
                    'info',
                    undefined,
                    !!data ? true : false
                );

                if (!data) {
                    refresh();
                }
            },
            onFailure: () => {
                notify(
                    'resources.documents.notifications.edit_error',
                    'warning'
                );
            },
            undoable: !!data ? true : false,
        };

        if (!!data) {
            update(
                {
                    payload: {
                        id,
                        data: {
                            ...data,
                            markdown,
                        },
                    },
                },
                options
            );
            return;
        }

        create(
            {
                payload: {
                    data: {
                        id,
                        locale: documentationLocales[locale],
                        markdown,
                        navtitle,
                        ordinal: 0,
                        status: 'PUBLISHED',
                        title: navtitle,
                        type: entityType,
                        typeUuid: entityUuid,
                    },
                },
            },
            options
        );
    };

    return [{ data, loaded, loading }, handleSave];
};
