import {hovercardAttributesForActor} from '@github-ui/hovercards'
import {ProfileReference} from '@github-ui/profile-reference'
import {Link} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {VALUES} from '../constants/values'
import type {AssignmentEventAssignee$key} from './__generated__/AssignmentEventAssignee.graphql'
import styles from './assignees.module.css'

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
const AssignmentEventAssigneeFragment = graphql`
  fragment AssignmentEventAssignee on Actor {
    ... on User {
      __typename
      login
      resourcePath
      name
    }
    ... on Mannequin {
      __typename
      login
      resourcePath
      name
    }
    ... on Organization {
      __typename
      login
      resourcePath
    }
    ... on Bot {
      __typename
      login
      resourcePath
      isCopilot
      displayName
      isAgent
    }
  }
`

type AssignmentEventAssigneeProps = {
  assigneeRef?: AssignmentEventAssignee$key | undefined | null
}

export function AssignmentEventAssignee({assigneeRef}: AssignmentEventAssigneeProps): React.ReactElement {
  const assignee = useFragment(AssignmentEventAssigneeFragment, assigneeRef)

  if (assignee?.__typename === '%other') return <></>

  const assigneeLogin = assignee?.login || VALUES.ghost.login
  const isCopilot = assignee?.__typename === 'Bot' && assignee.isCopilot
  const isAgent = assignee?.__typename === 'Bot' && assignee.isAgent
  const isUser = assignee?.__typename === 'User' || assignee?.__typename === 'Organization'
  const showHovercard = isUser || isCopilot || isAgent
  const hovercardData = showHovercard ? hovercardAttributesForActor(assigneeLogin, {isCopilot, isAgent}) : {}
  const displayName = isCopilot
    ? VALUES.copilot.displayName
    : isAgent
      ? assignee.displayName
      : assigneeLogin || VALUES.ghost.login
  const profileName = assignee?.__typename === 'User' || assignee?.__typename === 'Mannequin' ? assignee.name : null
  return (
    <Link {...hovercardData} href={assignee?.resourcePath} className={styles.assigneeLink} inline>
      <ProfileReference login={displayName} profileName={profileName} isAgent={isAgent} />
    </Link>
  )
}

/**
 * @generated SignedSource<<2284accc606c66b97fdb43e41d8a4637>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type BlockedByAddedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly blockingIssue: {
    readonly " $fragmentSpreads": FragmentRefs<"IssueLink">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly " $fragmentType": "BlockedByAddedEvent";
};
export type BlockedByAddedEvent$key = {
  readonly " $data"?: BlockedByAddedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"BlockedByAddedEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BlockedByAddedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Issue",
      "kind": "LinkedField",
      "name": "blockingIssue",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "IssueLink"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "BlockedByAddedEvent",
  "abstractKey": null
};

(node as any).hash = "9b71c7c5f106935993845ab688a12ef9";

export default node;

import {BlockedIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {getGroupCreatedAt} from '../utils/get-group-created-at'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {BlockedByAddedEvent$key} from './__generated__/BlockedByAddedEvent.graphql'
import styles from './DependencyEvent.module.css'
import {IssueLink} from './IssueLink'
import {Ago} from './row/Ago'
import {TimelineRow} from './row/TimelineRow'

export type BaseDependencyEventProps = {
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  repositoryId: string
  ownerLogin: string
}

type EventItem = BlockedByAddedEvent$key & {createdAt?: string}

type BlockedByAddedEventProps = BaseDependencyEventProps & {
  queryRef: EventItem
  rollupGroup?: Record<'BlockedByAddedEvent', EventItem[]>
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
export const BlockedByAddedEventFragment = graphql`
  fragment BlockedByAddedEvent on BlockedByAddedEvent {
    databaseId
    actor {
      ...TimelineRowEventActor
    }
    createdAt
    blockingIssue {
      ...IssueLink
    }
  }
`

export function BlockedByAddedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  rollupGroup,
  repositoryId,
  ownerLogin,
}: BlockedByAddedEventProps) {
  const {actor, createdAt, blockingIssue, databaseId} = useFragment(BlockedByAddedEventFragment, queryRef)

  if (!blockingIssue) {
    return null
  }

  const highlighted = String(databaseId) === highlightedEventId
  const rolledUpGroup = rollupGroup?.BlockedByAddedEvent || []
  const itemsToRender = rolledUpGroup.length === 0 ? [queryRef] : rolledUpGroup
  const eventCreatedAt = getGroupCreatedAt(queryRef.createdAt, rolledUpGroup)

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      showAgoTimestamp={false}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={BlockedIcon}
    >
      <TimelineRow.Main>
        <span>
          {itemsToRender.length === 1
            ? LABELS.timeline.blockedByAdded.single
            : LABELS.timeline.blockedByAdded.multiple(itemsToRender.length)}
        </span>{' '}
        {eventCreatedAt ? (
          <Ago timestamp={new Date(eventCreatedAt)} linkUrl={createIssueEventExternalUrl(issueUrl, databaseId)} />
        ) : null}
      </TimelineRow.Main>
      <TimelineRow.Secondary>
        <ul className={styles.issueDependenciesList}>
          {itemsToRender.map((item, index) => (
            <BlockedByAddedEventItem
              // eslint-disable-next-line @eslint-react/no-array-index-key
              key={`${databaseId}_${index}`}
              event={item}
              targetRepositoryId={repositoryId}
              targetOwnerLogin={ownerLogin}
            />
          ))}
        </ul>
      </TimelineRow.Secondary>
    </TimelineRow>
  )
}

function BlockedByAddedEventItem({
  event,
  targetRepositoryId,
  targetOwnerLogin,
}: {
  event: BlockedByAddedEvent$key
  targetRepositoryId: string
  targetOwnerLogin: string
}) {
  const {blockingIssue} = useFragment(BlockedByAddedEventFragment, event)

  if (!blockingIssue) {
    return null
  }

  return (
    <li className={styles.issueDependencyItem}>
      <IssueLink data={blockingIssue} targetRepositoryId={targetRepositoryId} targetOwnerLogin={targetOwnerLogin} />
    </li>
  )
}

/**
 * @generated SignedSource<<afbf3bee857a954dcb37b8cf5f9be468>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type BlockedByRemovedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly blockingIssue: {
    readonly " $fragmentSpreads": FragmentRefs<"IssueLink">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly " $fragmentType": "BlockedByRemovedEvent";
};
export type BlockedByRemovedEvent$key = {
  readonly " $data"?: BlockedByRemovedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"BlockedByRemovedEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BlockedByRemovedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Issue",
      "kind": "LinkedField",
      "name": "blockingIssue",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "IssueLink"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "BlockedByRemovedEvent",
  "abstractKey": null
};

(node as any).hash = "258e5a5ef42c29ff6c0983962ba379c7";

export default node;

import {BlockedIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {getGroupCreatedAt} from '../utils/get-group-created-at'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {BlockedByRemovedEvent$key} from './__generated__/BlockedByRemovedEvent.graphql'
import type {BaseDependencyEventProps} from './BlockedByAddedEvent'
import styles from './DependencyEvent.module.css'
import {IssueLink} from './IssueLink'
import {Ago} from './row/Ago'
import {TimelineRow} from './row/TimelineRow'

type EventItem = BlockedByRemovedEvent$key & {createdAt?: string}

type BlockedByRemovedEventProps = BaseDependencyEventProps & {
  queryRef: EventItem
  rollupGroup?: Record<'BlockedByRemovedEvent', EventItem[]>
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
export const BlockedByRemovedEventFragment = graphql`
  fragment BlockedByRemovedEvent on BlockedByRemovedEvent {
    databaseId
    actor {
      ...TimelineRowEventActor
    }
    createdAt
    blockingIssue {
      ...IssueLink
    }
  }
`

export function BlockedByRemovedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  rollupGroup,
  repositoryId,
  ownerLogin,
}: BlockedByRemovedEventProps) {
  const {actor, createdAt, blockingIssue, databaseId} = useFragment(BlockedByRemovedEventFragment, queryRef)

  if (!blockingIssue) {
    return null
  }

  const highlighted = String(databaseId) === highlightedEventId
  const rolledUpGroup = rollupGroup?.BlockedByRemovedEvent || []
  const itemsToRender = rolledUpGroup.length === 0 ? [queryRef] : rolledUpGroup
  const eventCreatedAt = getGroupCreatedAt(queryRef.createdAt, rolledUpGroup)

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      showAgoTimestamp={false}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={BlockedIcon}
    >
      <TimelineRow.Main>
        <span>
          {itemsToRender.length === 1
            ? LABELS.timeline.blockedByRemoved.single
            : LABELS.timeline.blockedByRemoved.multiple(itemsToRender.length)}
        </span>{' '}
        {eventCreatedAt ? (
          <Ago timestamp={new Date(eventCreatedAt)} linkUrl={createIssueEventExternalUrl(issueUrl, databaseId)} />
        ) : null}
      </TimelineRow.Main>
      <TimelineRow.Secondary>
        <ul className={styles.issueDependenciesList}>
          {itemsToRender.map((item, index) => (
            <BlockedByRemovedEventItem
              // eslint-disable-next-line @eslint-react/no-array-index-key
              key={`${databaseId}_${index}`}
              event={item}
              targetRepositoryId={repositoryId}
              targetOwnerLogin={ownerLogin}
            />
          ))}
        </ul>
      </TimelineRow.Secondary>
    </TimelineRow>
  )
}

function BlockedByRemovedEventItem({
  event,
  targetRepositoryId,
  targetOwnerLogin,
}: {
  event: BlockedByRemovedEvent$key
  targetRepositoryId: string
  targetOwnerLogin: string
}) {
  const {blockingIssue} = useFragment(BlockedByRemovedEventFragment, event)

  if (!blockingIssue) {
    return null
  }

  return (
    <li className={styles.issueDependencyItem}>
      <IssueLink data={blockingIssue} targetRepositoryId={targetRepositoryId} targetOwnerLogin={targetOwnerLogin} />
    </li>
  )
}

/**
 * @generated SignedSource<<64968701d806c6b169c3b698f6a76f4d>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type BlockingAddedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly blockedIssue: {
    readonly " $fragmentSpreads": FragmentRefs<"IssueLink">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly " $fragmentType": "BlockingAddedEvent";
};
export type BlockingAddedEvent$key = {
  readonly " $data"?: BlockingAddedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"BlockingAddedEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BlockingAddedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Issue",
      "kind": "LinkedField",
      "name": "blockedIssue",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "IssueLink"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "BlockingAddedEvent",
  "abstractKey": null
};

(node as any).hash = "c786519e55ce29bd725c36d300448d25";

export default node;

import {BlockedIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {getGroupCreatedAt} from '../utils/get-group-created-at'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {BlockingAddedEvent$key} from './__generated__/BlockingAddedEvent.graphql'
import type {BaseDependencyEventProps} from './BlockedByAddedEvent'
import styles from './DependencyEvent.module.css'
import {IssueLink} from './IssueLink'
import {Ago} from './row/Ago'
import {TimelineRow} from './row/TimelineRow'

type EventItem = BlockingAddedEvent$key & {createdAt?: string}

type BlockingAddedEventProps = BaseDependencyEventProps & {
  queryRef: EventItem
  rollupGroup?: Record<'BlockingAddedEvent', EventItem[]>
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
export const BlockingAddedEventFragment = graphql`
  fragment BlockingAddedEvent on BlockingAddedEvent {
    databaseId
    actor {
      ...TimelineRowEventActor
    }
    createdAt
    blockedIssue {
      ...IssueLink
    }
  }
`

export function BlockingAddedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  rollupGroup,
  repositoryId,
  ownerLogin,
}: BlockingAddedEventProps) {
  const {actor, createdAt, blockedIssue, databaseId} = useFragment(BlockingAddedEventFragment, queryRef)

  if (!blockedIssue) {
    return null
  }

  const highlighted = String(databaseId) === highlightedEventId
  const rolledUpGroup = rollupGroup?.BlockingAddedEvent || []
  const itemsToRender = rolledUpGroup.length === 0 ? [queryRef] : rolledUpGroup
  const eventCreatedAt = getGroupCreatedAt(queryRef.createdAt, rolledUpGroup)

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      showAgoTimestamp={false}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={BlockedIcon}
    >
      <TimelineRow.Main>
        <span>
          {itemsToRender.length === 1
            ? LABELS.timeline.blockingAdded.single
            : LABELS.timeline.blockingAdded.multiple(itemsToRender.length)}
        </span>{' '}
        {eventCreatedAt ? (
          <Ago timestamp={new Date(eventCreatedAt)} linkUrl={createIssueEventExternalUrl(issueUrl, databaseId)} />
        ) : null}
      </TimelineRow.Main>
      <TimelineRow.Secondary>
        <ul className={styles.issueDependenciesList}>
          {itemsToRender.map((item, index) => (
            <BlockingAddedEventItem
              // eslint-disable-next-line @eslint-react/no-array-index-key
              key={`${databaseId}_${index}`}
              event={item}
              targetRepositoryId={repositoryId}
              targetOwnerLogin={ownerLogin}
            />
          ))}
        </ul>
      </TimelineRow.Secondary>
    </TimelineRow>
  )
}

function BlockingAddedEventItem({
  event,
  targetRepositoryId,
  targetOwnerLogin,
}: {
  event: BlockingAddedEvent$key
  targetRepositoryId: string
  targetOwnerLogin: string
}) {
  const {blockedIssue} = useFragment(BlockingAddedEventFragment, event)

  if (!blockedIssue) {
    return null
  }

  return (
    <li className={styles.issueDependencyItem}>
      <IssueLink data={blockedIssue} targetRepositoryId={targetRepositoryId} targetOwnerLogin={targetOwnerLogin} />
    </li>
  )
}

/**
 * @generated SignedSource<<17d702c66f634611e6615a4ef6a2f25a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type BlockingRemovedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly blockedIssue: {
    readonly " $fragmentSpreads": FragmentRefs<"IssueLink">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly " $fragmentType": "BlockingRemovedEvent";
};
export type BlockingRemovedEvent$key = {
  readonly " $data"?: BlockingRemovedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"BlockingRemovedEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BlockingRemovedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Issue",
      "kind": "LinkedField",
      "name": "blockedIssue",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "IssueLink"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "BlockingRemovedEvent",
  "abstractKey": null
};

(node as any).hash = "8fc66f0b4dcd2b845d5859474da4ab49";

export default node;

import {BlockedIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {getGroupCreatedAt} from '../utils/get-group-created-at'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {BlockingRemovedEvent$key} from './__generated__/BlockingRemovedEvent.graphql'
import type {BaseDependencyEventProps} from './BlockedByAddedEvent'
import styles from './DependencyEvent.module.css'
import {IssueLink} from './IssueLink'
import {Ago} from './row/Ago'
import {TimelineRow} from './row/TimelineRow'

type EventItem = BlockingRemovedEvent$key & {createdAt?: string}

type BlockingRemovedEventProps = BaseDependencyEventProps & {
  queryRef: EventItem
  rollupGroup?: Record<'BlockingRemovedEvent', EventItem[]>
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
export const BlockingRemovedEventFragment = graphql`
  fragment BlockingRemovedEvent on BlockingRemovedEvent {
    databaseId
    actor {
      ...TimelineRowEventActor
    }
    createdAt
    blockedIssue {
      ...IssueLink
    }
  }
`

export function BlockingRemovedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  rollupGroup,
  repositoryId,
  ownerLogin,
}: BlockingRemovedEventProps) {
  const {actor, createdAt, blockedIssue, databaseId} = useFragment(BlockingRemovedEventFragment, queryRef)

  if (!blockedIssue) {
    return null
  }

  const highlighted = String(databaseId) === highlightedEventId
  const rolledUpGroup = rollupGroup?.BlockingRemovedEvent || []
  const itemsToRender = rolledUpGroup.length === 0 ? [queryRef] : rolledUpGroup
  const eventCreatedAt = getGroupCreatedAt(queryRef.createdAt, rolledUpGroup)

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      showAgoTimestamp={false}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={BlockedIcon}
    >
      <TimelineRow.Main>
        <span>
          {itemsToRender.length === 1
            ? LABELS.timeline.blockingRemoved.single
            : LABELS.timeline.blockingRemoved.multiple(itemsToRender.length)}
        </span>{' '}
        {eventCreatedAt ? (
          <Ago timestamp={new Date(eventCreatedAt)} linkUrl={createIssueEventExternalUrl(issueUrl, databaseId)} />
        ) : null}
      </TimelineRow.Main>
      <TimelineRow.Secondary>
        <ul className={styles.issueDependenciesList}>
          {itemsToRender.map((item, index) => (
            <BlockingRemovedEventItem
              // eslint-disable-next-line @eslint-react/no-array-index-key
              key={`${databaseId}_${index}`}
              event={item}
              targetRepositoryId={repositoryId}
              targetOwnerLogin={ownerLogin}
            />
          ))}
        </ul>
      </TimelineRow.Secondary>
    </TimelineRow>
  )
}

function BlockingRemovedEventItem({
  event,
  targetRepositoryId,
  targetOwnerLogin,
}: {
  event: BlockingRemovedEvent$key
  targetRepositoryId: string
  targetOwnerLogin: string
}) {
  const {blockedIssue} = useFragment(BlockingRemovedEventFragment, event)

  if (!blockedIssue) {
    return null
  }

  return (
    <li className={styles.issueDependencyItem}>
      <IssueLink data={blockedIssue} targetRepositoryId={targetRepositoryId} targetOwnerLogin={targetOwnerLogin} />
    </li>
  )
}

import {ready} from '@github-ui/document-ready'
import {type CacheNode, getDocumentAttributes, getTurboCacheNodes} from './utils'

const turboPageNodes: Map<string, CacheNode> = new Map()
const turboDocumentAttributes: Map<string, Attr[]> = new Map()

export const getCachedNode = () => turboPageNodes.get(document.location.href)
export const setCachedNode = (url: string, node: CacheNode) => turboPageNodes.set(url, node)
export const setDocumentAttributesCache = () =>
  turboDocumentAttributes.set(document.location.href, getDocumentAttributes())
export const getCachedAttributes = () => turboDocumentAttributes.get(document.location.href)
;(async () => {
  await ready
  setCachedNode(document.location.href, getTurboCacheNodes(document))
  setDocumentAttributesCache()
})()

/**
 * @generated SignedSource<<6191c04b51794abb9cd61f62a3dbffff>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
export type IssueStateReason = "COMPLETED" | "DUPLICATE" | "NOT_PLANNED" | "REOPENED" | "%future added value";
import type { FragmentRefs } from "relay-runtime";
export type ClosedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly closer: {
    readonly __typename: "Commit";
    readonly abbreviatedOid: string;
    readonly repository: {
      readonly name: string;
      readonly owner: {
        readonly login: string;
      };
    };
    readonly url: string;
  } | {
    readonly __typename: "ProjectV2";
    readonly title: string;
    readonly url: string;
  } | {
    readonly __typename: "PullRequest";
    readonly number: number;
    readonly repository: {
      readonly id: string;
      readonly name: string;
      readonly owner: {
        readonly login: string;
      };
    };
    readonly url: string;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
  readonly closingProjectItemStatus: string | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly duplicateOf: {
    readonly " $fragmentSpreads": FragmentRefs<"IssueLink">;
  } | null | undefined;
  readonly stateReason: IssueStateReason | null | undefined;
  readonly " $fragmentType": "ClosedEvent";
};
export type ClosedEvent$key = {
  readonly " $data"?: ClosedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"ClosedEvent">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "owner",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "login",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ClosedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "stateReason",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "duplicateOf",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "IssueLink"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "closingProjectItemStatus",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "closer",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__typename",
          "storageKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "title",
              "storageKey": null
            }
          ],
          "type": "ProjectV2",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "number",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "Repository",
              "kind": "LinkedField",
              "name": "repository",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "id",
                  "storageKey": null
                },
                (v1/*: any*/),
                (v2/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "type": "PullRequest",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "abbreviatedOid",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "Repository",
              "kind": "LinkedField",
              "name": "repository",
              "plural": false,
              "selections": [
                (v1/*: any*/),
                (v2/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "type": "Commit",
          "abstractKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ClosedEvent",
  "abstractKey": null
};
})();

(node as any).hash = "c0e99313c436b525f30e8bb8f39cb01b";

export default node;

import {useGetHovercardAttributesForType} from '@github-ui/hovercards/use-get-hovercard-attributes-for-type'
import {useIssueState} from '@github-ui/issue-pr-state'
import type {IssueStateReasonType} from '@github-ui/issue-pr-state/constants'
import {TableIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'
import {Octicon} from '@primer/react/deprecated'
import {useMemo} from 'react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {formatIssueReference} from '../utils/format-issue-reference'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {ClosedEvent$key} from './__generated__/ClosedEvent.graphql'
import styles from './ClosedEvent.module.css'
import {IssueLink} from './IssueLink'
import {TimelineRow} from './row/TimelineRow'

export type ClosedEventProps = {
  queryRef: ClosedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  timelineEventBaseUrl: string
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  showStateReason?: boolean
  repositoryId: string
  ownerLogin: string
}

export function ClosedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  timelineEventBaseUrl,
  highlightedEventId,
  refAttribute,
  showStateReason = true,
  repositoryId,
  ownerLogin,
}: ClosedEventProps): React.ReactElement {
  const {actor, createdAt, stateReason, databaseId, closer, closingProjectItemStatus, duplicateOf} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment ClosedEvent on ClosedEvent {
        databaseId
        createdAt
        stateReason
        duplicateOf {
          ...IssueLink @dangerously_unaliased_fixme
        }
        closingProjectItemStatus
        closer {
          __typename
          ... on ProjectV2 {
            url
            title
          }
          ... on PullRequest {
            url
            number
            repository {
              id
              name
              owner {
                login
              }
            }
          }
          ... on Commit {
            url
            abbreviatedOid
            repository {
              name
              owner {
                login
              }
            }
          }
        }
        actor {
          ...TimelineRowEventActor
        }
      }
    `,
    queryRef,
  )

  const getHovercardAttributesForType = useGetHovercardAttributesForType()
  const highlighted = String(databaseId) === highlightedEventId
  const {
    getStateQuery,
    issueStateTimelineIcon: icon,
    issueStateColor,
  } = useIssueState({state: 'CLOSED', stateReason: stateReason as IssueStateReasonType})
  const {stateChangeQuery, stateReasonString} = getStateQuery()

  const queryUrl = useMemo(() => {
    return `${timelineEventBaseUrl}?q=${stateReason && encodeURIComponent(stateChangeQuery)}`
  }, [stateChangeQuery, stateReason, timelineEventBaseUrl])

  const closedByCommit = closer?.__typename === 'Commit'
  const closedByMemexProject = closer?.__typename === 'ProjectV2'
  const closerPullRequestUrl = closer && closer.__typename === 'PullRequest' ? closer.url : undefined
  const closerCommitUrl = closedByCommit ? closer.url : undefined
  const closerMemexProjectUrl = closedByMemexProject ? closer.url : undefined

  const closerPullRequestReference =
    closer && closer.__typename === 'PullRequest'
      ? formatIssueReference(
          {
            number: closer.number,
            ownerLogin: closer.repository.owner.login,
            repoId: closer.repository.id,
            repoName: closer.repository.name,
          },
          repositoryId,
          ownerLogin,
        )
      : undefined

  const hovercardAttributes = closer
    ? closer.__typename === 'Commit'
      ? getHovercardAttributesForType('commit', {
          owner: closer.repository.owner.login,
          repo: closer.repository.name,
          commitish: closer.abbreviatedOid,
        })
      : closer.__typename === 'PullRequest'
        ? getHovercardAttributesForType('pull_request', {
            owner: closer.repository.owner.login,
            repo: closer.repository.name,
            pullRequestNumber: closer.number,
          })
        : {}
    : {}

  const closerLink = closedByMemexProject ? (
    <>
      <Octicon icon={TableIcon} />{' '}
      <Link href={closerMemexProjectUrl} data-testid="closer-link" inline className={styles.stateReasonLink}>
        {closer.title}
      </Link>
    </>
  ) : (
    <Link
      href={closedByCommit ? closerCommitUrl : closerPullRequestUrl}
      {...hovercardAttributes}
      data-testid="closer-link"
      className={styles.closerLink}
    >
      {closedByCommit ? `${closer.abbreviatedOid}` : closerPullRequestReference}
    </Link>
  )

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={icon}
      iconColoring={{backgroundColor: issueStateColor, color: 'white'}}
    >
      <TimelineRow.Main>
        {`${LABELS.timeline.closedThis} `}
        {stateReason && showStateReason && (
          <>
            {`${LABELS.timeline.as} ${duplicateOf ? ' a ' : ''}`}
            <Link data-testid="state-reason-link" href={queryUrl} inline className={styles.stateReasonLink}>
              {stateReasonString}
            </Link>
          </>
        )}
        {closer && (
          <>
            {closedByMemexProject ? `by moving to ${closingProjectItemStatus} ` : ''}
            {`${LABELS.timeline.in} `}
            {closerLink}
          </>
        )}
        {duplicateOf && (
          <>
            {`${LABELS.timeline.of} `}
            <IssueLink inline data={duplicateOf} targetRepositoryId={repositoryId} targetOwnerLogin={ownerLogin} />{' '}
          </>
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

import type {ActionListItemProps} from '@primer/react'
import {ActionList} from '@primer/react'

import {type CommandId, getCommandMetadata} from '../commands'
import {useCommandsContext} from '../commands-context'
import {CommandKeybindingHint} from './CommandKeybindingHint'

export interface CommandActionListItemProps extends Omit<ActionListItemProps, 'onClick'> {
  commandId: CommandId
  /** If `children` is not provided, the item will render the command name by default. */
  children?: ActionListItemProps['children']
  /**
   * Set the item description (components that wrap Primer components can't use the composable APIs, so this is
   * required instead of `ActionList.Description`).
   */
  description?: React.ReactNode
  /**
   * Set the leading visual (components that wrap Primer components can't use the composable APIs, so this is
   * required instead of `ActionList.LeadingVisual`).
   */
  leadingVisual?: React.ReactNode
  /**
   * Override the trailing visual (components that wrap Primer components can't use the composable APIs, so this is
   * required instead of `ActionList.TrailingVisual`).
   *
   * By default, if a keybinding is configured for the command, this will be a visual keybinding hint. To disable this
   * without providing an alternative, set `trailingVisual` to `null`.
   */
  trailingVisual?: React.ReactNode

  ref?: React.Ref<HTMLLIElement>
}

/**
 * `CommandActionListItem` is a wrapper around `@primer/react` `ActionList.Item`, but instead of an `onClick` handler
 * it takes a command ID and handles clicks by emitting command trigger events.
 *
 * If the command is gated by a disabled feature flag, nothing will render.
 */
export const CommandActionListItem = ({
  commandId,
  children,
  description,
  leadingVisual,
  trailingVisual,
  ...forwardProps
}: CommandActionListItemProps) => {
  const metadata = getCommandMetadata(commandId)
  const {triggerCommand} = useCommandsContext()

  if (!metadata) return null

  return (
    <ActionList.Item {...forwardProps} onSelect={event => triggerCommand(commandId, event.nativeEvent)}>
      {children ?? <span>{metadata.name}</span>}

      {description ? <ActionList.Description truncate>{description}</ActionList.Description> : null}

      {leadingVisual ? <ActionList.LeadingVisual>{leadingVisual}</ActionList.LeadingVisual> : null}

      {
        // Allow disabling the keybinding hint by explicitly setting `trailingVisual` to `null`
        trailingVisual !== null && (
          <ActionList.TrailingVisual>
            <span className="sr-only">(</span>
            {trailingVisual ?? <CommandKeybindingHint commandId={commandId} format="condensed" />}
            <span className="sr-only">)</span>
          </ActionList.TrailingVisual>
        )
      }
    </ActionList.Item>
  )
}
CommandActionListItem.displayName = 'ActionList.CommandItem'

import type {ButtonProps} from '@primer/react'
import {Button} from '@primer/react'

import {type CommandId, getCommandMetadata} from '../commands'
import {useCommandsContext} from '../commands-context'
import {CommandKeybindingHint} from './CommandKeybindingHint'

export interface CommandButtonProps extends ButtonProps {
  commandId: CommandId
  /** If `children` is not provided, the button will render the command name as its label by default. */
  children?: ButtonProps['children']
  /** If `true` and no `trailingVisual` is set, will render a keybinding hint as the trailing visual. */
  showKeybindingHint?: boolean

  ref?: React.Ref<HTMLButtonElement>
}

const ButtonKeybindingHint = ({commandId}: {commandId: CommandId}) => (
  // This becomes part of the label which gets noisy (but we don't want to hide this info from screen reader users),
  // so we wrap in hidden parentheses to offset it a little and make it read better
  <>
    <span className="sr-only">(</span>
    <CommandKeybindingHint commandId={commandId} format="condensed" />
    <span className="sr-only">)</span>
  </>
)

/**
 * `CommandButton` is a wrapper around `@primer/react` `Button`, but instead of an `onClick` handler it takes a
 * command ID and handles clicks by emitting command trigger events.
 *
 * If the command is gated by a disabled feature flag, nothing will render.
 */
export const CommandButton = ({
  ref,
  commandId,
  children,
  trailingVisual,
  showKeybindingHint = false,
  onClick: externalOnClick,
  ...forwardProps
}: CommandButtonProps) => {
  const metadata = getCommandMetadata(commandId)
  const {triggerCommand} = useCommandsContext()

  if (!metadata) return null

  return (
    <Button
      {...forwardProps}
      onClick={event => {
        externalOnClick?.(event)
        if (!event.defaultPrevented) triggerCommand(commandId, event.nativeEvent)
      }}
      trailingVisual={
        trailingVisual ?? (showKeybindingHint ? <ButtonKeybindingHint commandId={commandId} /> : undefined)
      }
      ref={ref}
    >
      {children ?? metadata.name}
    </Button>
  )
}
CommandButton.displayName = 'CommandButton'

import {CommandId} from './commands'

export class CommandEvent<Id extends CommandId = CommandId> {
  readonly commandId: Id
  constructor(commandId: Id) {
    this.commandId = commandId
  }
}

export type CommandEventHandler<Id extends CommandId = CommandId> = (event: CommandEvent<Id>) => void

export type CommandEventHandlersMapEntry<Id extends CommandId = CommandId> = [key: Id, handler: CommandEventHandler<Id>]

export type CommandEventHandlersMap = {
  [Id in CommandId]?: CommandEventHandler<Id>
}
export const CommandEventHandlersMap = {
  /**
   * Iterate over the entries in a handlers map.
   *
   * `Object.entries` will broaden the entry type to `[string, CommandEventHandler]` because objects can have unknown
   * keys (ie, `{a: 1, b: 2}` is assignable to `{a: number}`), so this narrows it back down.
   */
  entries: (map: CommandEventHandlersMap) =>
    Object.entries(map).filter(
      (entry): entry is CommandEventHandlersMapEntry => CommandId.is(entry[0]) && entry[1] !== undefined,
    ),
  keys: (map: CommandEventHandlersMap) => Object.keys(map).filter(CommandId.is),
}

import type {IconButtonProps} from '@primer/react'
import {IconButton} from '@primer/react'

import {type CommandId, getCommandMetadata, getKeybinding} from '../commands'
import {useCommandsContext} from '../commands-context'

export interface CommandIconButtonProps extends Omit<IconButtonProps, 'aria-label' | 'aria-labelledby'> {
  commandId: CommandId
  /** If `aria-label` is not provided, the button will render the command name as its label by default. */
  ['aria-label']?: IconButtonProps['aria-label']

  ref?: React.Ref<HTMLButtonElement>
}

/**
 * `CommandButton` is a wrapper around `@primer/react` `Button`, but instead of an `onClick` handler it takes a
 * command ID and handles clicks by emitting command trigger events.
 *
 * If the command is gated by a disabled feature flag, nothing will render.
 */
export const CommandIconButton = ({
  ref,
  commandId,
  ['aria-label']: ariaLabel,
  onClick: externalOnClick,
  icon,
  ...forwardProps
}: CommandIconButtonProps) => {
  const metadata = getCommandMetadata(commandId)
  const {triggerCommand} = useCommandsContext()

  if (!metadata) return null

  return (
    <IconButton
      aria-label={ariaLabel ?? metadata.name}
      onClick={event => {
        externalOnClick?.(event)
        if (!event.defaultPrevented) triggerCommand(commandId, event.nativeEvent)
      }}
      icon={icon}
      ref={ref}
      keybindingHint={getKeybinding(commandId)}
      {...forwardProps}
    />
  )
}
CommandIconButton.displayName = 'CommandIconButton'

import {KeybindingHint, type KeybindingHintProps} from '@primer/react/experimental'

import type {CommandId} from '../commands'
import {getKeybinding} from '../commands'

interface CommandKeybindingHintProps extends Omit<KeybindingHintProps, 'keys'> {
  commandId: CommandId
}

/** Renders a visual representing the keybinding for a command. If no keybinding is present, renders nothing. */
export const CommandKeybindingHint = ({commandId, ...props}: CommandKeybindingHintProps) => {
  const keys = getKeybinding(commandId)
  return keys ? <KeybindingHint keys={keys} {...props} /> : null
}

import {isFeatureEnabled} from '@github-ui/feature-flags'
import type {JSFeatureFlag} from '@github-ui/feature-flags/client-feature-flags'
import type {NormalizedSequenceString} from '@github-ui/hotkey'
import {normalizeSequence} from '@github-ui/hotkey'

import jsonMetadata from './__generated__/ui-commands.json'

const {commands, services} = jsonMetadata

const serviceCommandIds = new Set(Object.keys(commands) as CommandId[])

export type ServiceId = keyof typeof services

/** Full joined command ID (in `serviceId:commandId` form). */
export type CommandId = keyof typeof commands
export const CommandId = {
  is: (str: string): str is CommandId => serviceCommandIds.has(str as CommandId),
  getServiceId: (commandId: CommandId) => commandId.split(':')[0] as ServiceId,
}

export interface CommandMetadata {
  name: string
  description: string
  defaultBinding?: string
  featureFlag?: JSFeatureFlag
}

/**
 * Get the documentation metadata for the given command. Returns `undefined` if the command is
 * disabled via feature flag.
 */
export const getCommandMetadata = (commandId: CommandId) => {
  const metadata = commands[commandId] as CommandMetadata
  return !metadata.featureFlag || isFeatureEnabled(metadata.featureFlag) ? metadata : undefined
}

/** Get the documentation metadata for the given service. */
export const getServiceMetadata = (serviceId: ServiceId) => services[serviceId]

export const getKeybinding = (commandId: CommandId): NormalizedSequenceString | undefined => {
  const metadata = getCommandMetadata(commandId)
  return metadata?.defaultBinding ? normalizeSequence(metadata.defaultBinding) : undefined
}

/** Returns a map of id to keybinding, without entries for commands that don't have keybindings. */
export const getKeybindings = (commandIds: CommandId[]) =>
  new Map(
    commandIds
      .map(id => [id, getKeybinding(id)])
      .filter((entry): entry is [CommandId, NormalizedSequenceString] => entry[1] !== undefined),
  )

import {createContext, use} from 'react'

import type {CommandId} from './commands'
import {dispatchGlobalCommand} from './components/GlobalCommands'

interface CommandsContext {
  /**
   * @param isLimitedScope Was this command originally caught by a `ScopedCommands.LimitedScope` wrapper?
   */
  triggerCommand: (id: CommandId, domEvent: KeyboardEvent | MouseEvent, isLimitedScope?: boolean) => void | false
  /** Notify the provider that these commands should have limited keybinding scope. */
  registerLimitedKeybindingScope: (uniqueKey: string, commands: CommandId[]) => void
}

const CommandsContext = createContext<CommandsContext>({
  triggerCommand(id, domEvent, isLimitedScope = false) {
    // Commands caught by `ScopedCommands.LimitedScope` should not trigger global events and should not `preventDefault`
    // if no handler is encountered for them
    if (isLimitedScope) return false
    // Without any scope context, we just emit a global event
    dispatchGlobalCommand(id, domEvent)
  },
  registerLimitedKeybindingScope: () => {},
})

export const CommandsContextProvider = CommandsContext

export const useCommandsContext = () => use(CommandsContext)

import {useEffect, useId} from 'react'

import {CommandEventHandlersMap} from './command-event'
import {CommandId, getCommandMetadata, getServiceMetadata, type ServiceId} from './commands'

/**
 * Registered command IDs. The key is a globally unique ID for each source that will be used to unregister or update
 * the commands; this allows commands to be registered multiple times on a page (ie, in different scopes).
 */
const registeredCommands = new Map<string, CommandId[]>()

export type UIService = {
  id: string
  name: string
}

export type UICommand = {
  id: CommandId
  name: string
  description: string
  keybinding?: string | string[]
  alwaysCtrl?: boolean
}

export type UICommandGroup = {
  service: UIService
  commands: UICommand[]
}

/**
 * Get the set of IDs of all commands currently registered on the page, regardless of scope. From these IDs the
 * command metadata can be obtained with `getCommandMetadata(commandId)`, and the service metadata can be obtained with
 * `getServiceMetadata(CommandId.getServiceId(commandId))`.
 */
export function getAllRegisteredCommands(): UICommandGroup[] {
  const uiCommandGroupMap = new Map<ServiceId, UICommandGroup>()
  for (const commandId of new Set(Array.from(registeredCommands.values()).flat())) {
    const serviceId = CommandId.getServiceId(commandId)
    if (!uiCommandGroupMap.has(serviceId)) {
      const service = getServiceMetadata(serviceId)
      uiCommandGroupMap.set(serviceId, {
        service: {id: service.id, name: service.name},
        commands: [],
      })
    }
    const command = getCommandMetadata(commandId)
    if (command && command.defaultBinding) {
      uiCommandGroupMap.get(serviceId)?.commands.push({
        id: commandId,
        name: command.name,
        description: command.description,
        keybinding: command.defaultBinding,
      })
    }
  }

  return Array.from(uiCommandGroupMap.values())
}

/** Register commands into the global command registry for display in help dialog. */
export const useRegisterCommands = (commands: CommandEventHandlersMap) => {
  const sourceId = useId()

  useEffect(() => {
    registeredCommands.set(sourceId, CommandEventHandlersMap.keys(commands))

    return () => {
      registeredCommands.delete(sourceId)
    }
  }, [commands, sourceId])
}

/** Return a copy of the array without the first encountered instance of `value` (based on `===` comparison). */
export function filterOnce<T>(array: readonly T[], value: T) {
  let encounteredOnce = false
  return array.filter(el => {
    if (el === value && !encounteredOnce) {
      encounteredOnce = true
      return false
    }
    return true
  })
}

export function getActiveModal() {
  const modals =
    // unfortunately, jsdom doesn't support yet the `:modal` pseudo-class
    // and throws an error in tests, so we remove it from the query
    process.env.NODE_ENV === 'test'
      ? [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')]
      : [...document.querySelectorAll('dialog:modal, [role="dialog"][aria-modal="true"]')]
  const nonEmptyModals = modals.filter(modal => {
    return modal.childNodes.length > 0 && elementHasNonZeroHeight(modal)
  })
  return nonEmptyModals.length ? nonEmptyModals[nonEmptyModals.length - 1] : null
}

export function isInsideModal(modal: Element, element?: HTMLElement | null) {
  if (!element) {
    return false
  }

  return modal.contains(element) ?? false
}

function elementHasNonZeroHeight(element: Element): boolean {
  if (element.clientHeight > 0) return true

  for (const child of element.children) {
    if (elementHasNonZeroHeight(child)) return true
  }

  return false
}

export function setsEqual(a: Set<unknown>, b: Set<unknown>) {
  if (a.size !== b.size) return false
  for (const el of a) if (!b.has(el)) return false
  return true
}

/**
 * @generated SignedSource<<e42d162b328864ca2627668fad3b59b6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type CommentDeletedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly deletedCommentAuthor: {
    readonly __typename: string;
    readonly login: string;
    readonly name?: string | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "CommentDeletedEvent";
};
export type CommentDeletedEvent$key = {
  readonly " $data"?: CommentDeletedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"CommentDeletedEvent">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CommentDeletedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "deletedCommentAuthor",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__typename",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "login",
          "storageKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v0/*: any*/),
          "type": "User",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v0/*: any*/),
          "type": "Mannequin",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v0/*: any*/),
          "type": "EnterpriseUserAccount",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "CommentDeletedEvent",
  "abstractKey": null
};
})();

(node as any).hash = "7c1dc6354db20f68edaeaff80be1a29f";

export default node;

/**
 * @generated SignedSource<<251a7255fb8f653fc79b1bea3bd693b6>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
import type { FragmentRefs } from "relay-runtime";
export type ConnectedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly subject: {
    readonly isDraft?: boolean;
    readonly isInMergeQueue?: boolean;
    readonly number?: number;
    readonly repository?: {
      readonly name: string;
      readonly owner: {
        readonly login: string;
      };
    };
    readonly state?: PullRequestState;
    readonly title?: string;
    readonly url?: string;
  };
  readonly " $fragmentType": "ConnectedEvent";
};
export type ConnectedEvent$key = {
  readonly " $data"?: ConnectedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"ConnectedEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ConnectedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "subject",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "title",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "url",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "number",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "state",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "isDraft",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "isInMergeQueue",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "Repository",
              "kind": "LinkedField",
              "name": "repository",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "owner",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "login",
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "type": "PullRequest",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ConnectedEvent",
  "abstractKey": null
};

(node as any).hash = "6dbcebd6baa492ec1cc25caab2e70a45";

export default node;

import {useGetHovercardAttributesForType} from '@github-ui/hovercards/use-get-hovercard-attributes-for-type'
import {useIssueState} from '@github-ui/issue-pr-state'
import type {PullRequestStateType} from '@github-ui/issue-pr-state/constants'
import {CrossReferenceIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {ConnectedEvent$key} from './__generated__/ConnectedEvent.graphql'
import styles from './ConnectedEvent.module.css'
import {TimelineRow} from './row/TimelineRow'

type ConnectedEventProps = {
  queryRef: ConnectedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function ConnectedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: ConnectedEventProps): React.ReactElement {
  const {actor, createdAt, subject, databaseId} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment ConnectedEvent on ConnectedEvent {
        databaseId
        actor {
          ...TimelineRowEventActor
        }
        createdAt
        subject {
          ... on PullRequest {
            title
            url
            number
            state
            isDraft
            isInMergeQueue
            repository {
              name
              owner {
                login
              }
            }
          }
        }
      }
    `,
    queryRef,
  )

  const {title, number, url, isDraft, isInMergeQueue, state, repository} = subject || {}

  const getHovercardAttributesForType = useGetHovercardAttributesForType()
  const {sourceIcon} = useIssueState({state: state as PullRequestStateType})

  const PullStateIcon = sourceIcon('PullRequest', isDraft, isInMergeQueue)
  const highlighted = String(databaseId) === highlightedEventId

  const hovercardAttributes =
    repository && number
      ? getHovercardAttributesForType('pull_request', {
          owner: repository.owner.login,
          repo: repository.name,
          pullRequestNumber: number,
        })
      : {}

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={CrossReferenceIcon}
    >
      <TimelineRow.Main>
        {LABELS.timeline.linkedAClosingPR}
        {/* eslint-disable-next-line react-hooks/static-components */}
        <PullStateIcon className="ml-1 mr-1" />
        <Link href={url} target="_blank" {...hovercardAttributes} inline className={styles.linkedPullRequestLink}>
          {`${title} #${number}`}
        </Link>
      </TimelineRow.Main>
    </TimelineRow>
  )
}

/**
 * @generated SignedSource<<7bea96f0761c37327f7a0d2fb4202cca>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type ConvertedFromDraftEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly " $fragmentType": "ConvertedFromDraftEvent";
};
export type ConvertedFromDraftEvent$key = {
  readonly " $data"?: ConvertedFromDraftEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"ConvertedFromDraftEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ConvertedFromDraftEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    }
  ],
  "type": "ConvertedFromDraftEvent",
  "abstractKey": null
};

(node as any).hash = "3719925429eadd15091ec256d7d9c8fd";

export default node;

import {IssueDraftIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {ConvertedFromDraftEvent$key} from './__generated__/ConvertedFromDraftEvent.graphql'
import {TimelineRow} from './row/TimelineRow'

type ConvertedFromDraftEventProps = {
  queryRef: ConvertedFromDraftEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function ConvertedFromDraftEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: ConvertedFromDraftEventProps): React.ReactElement {
  const {actor, createdAt, databaseId} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment ConvertedFromDraftEvent on ConvertedFromDraftEvent {
        createdAt
        actor {
          ...TimelineRowEventActor
        }
        databaseId
      }
    `,
    queryRef,
  )

  const highlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={IssueDraftIcon}
    >
      <TimelineRow.Main>{`${LABELS.timeline.convertedFromDraftIssue} `}</TimelineRow.Main>
    </TimelineRow>
  )
}

/**
 * @generated SignedSource<<dd83a9d021911d76374bb30c3ded02b3>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type ConvertedToDiscussionEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly discussion: {
    readonly number: number;
    readonly url: string;
  } | null | undefined;
  readonly " $fragmentType": "ConvertedToDiscussionEvent";
};
export type ConvertedToDiscussionEvent$key = {
  readonly " $data"?: ConvertedToDiscussionEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"ConvertedToDiscussionEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ConvertedToDiscussionEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Discussion",
      "kind": "LinkedField",
      "name": "discussion",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "url",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "number",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ConvertedToDiscussionEvent",
  "abstractKey": null
};

(node as any).hash = "57a32d9c56f6a2acde82f09bc62414cb";

export default node;

import {CommentDiscussionIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {ConvertedToDiscussionEvent$key} from './__generated__/ConvertedToDiscussionEvent.graphql'
import styles from './ConvertedToDiscussionEvent.module.css'
import {TimelineRow} from './row/TimelineRow'

type ConvertedToDiscussionEventProps = {
  queryRef: ConvertedToDiscussionEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function ConvertedToDiscussionEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: ConvertedToDiscussionEventProps): React.ReactElement {
  const {actor, createdAt, discussion, databaseId} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment ConvertedToDiscussionEvent on ConvertedToDiscussionEvent {
        databaseId
        actor {
          ...TimelineRowEventActor
        }
        createdAt
        discussion {
          url
          number
        }
      }
    `,
    queryRef,
  )

  const highlighted = String(databaseId) === highlightedEventId
  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={CommentDiscussionIcon}
    >
      <TimelineRow.Main>
        {LABELS.timeline.convertedToDiscussion}
        {discussion && (
          <Link
            href={`${discussion.url}`}
            aria-label={`Discussion #${discussion.number}`}
            inline
            className={styles.discussionLink}
          >
            {` #${discussion.number} `}
          </Link>
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

import safeStorage from '@github-ui/safe-storage'

export type Listener = () => void

// Global registry of all store caches for test cleanup
// Exposed on window so tests can clear without importing (avoids vi.mock issues)
const allCaches: Array<Map<string, unknown>> = []

declare global {
  interface Window {
    __SAFE_STORAGE_CLEAR_ALL_CACHES__?: () => void
  }
}

// Register global cleanup function
if (typeof window !== 'undefined') {
  window.__SAFE_STORAGE_CLEAR_ALL_CACHES__ = () => {
    for (const cache of allCaches) {
      cache.clear()
    }
  }
}

export const createStore = (storageType: 'localStorage' | 'sessionStorage') => {
  const storage = safeStorage(storageType)

  const cache = new Map<string, unknown>()
  const listeners = new Map<string, Set<Listener>>()

  // Register this cache for global cleanup
  allCaches.push(cache)

  function isEqual<T>(a: T, b: T): boolean {
    if (a === b) return true
    try {
      return JSON.stringify(a) === JSON.stringify(b)
    } catch {
      // Circular references or other non-serializable values
      return false
    }
  }

  function emit(key: string): void {
    const set = listeners.get(key)
    if (set) {
      for (const listener of set) {
        listener()
      }
    }
  }

  function subscribe(key: string, listener: Listener): () => void {
    let set = listeners.get(key)
    if (!set) {
      set = new Set()
      listeners.set(key, set)
    }
    set.add(listener)
    return () => {
      set.delete(listener)
      // Clean up empty listener sets to prevent memory leaks
      if (set.size === 0) {
        listeners.delete(key)
      }
    }
  }

  function readStorage<T>(key: string, initial: T): T {
    // Always return cached value if present - critical for useSyncExternalStore contract
    if (cache.has(key)) {
      return cache.get(key) as T
    }

    try {
      const raw = storage.getItem(key)
      const value = raw == null ? initial : JSON.parse(raw)
      cache.set(key, value)
      return value
    } catch {
      cache.set(key, initial)
      return initial
    }
  }

  function writeStorage<T>(key: string, value: T): void {
    const prev = cache.get(key)
    if (isEqual(prev, value)) return

    // Update cache and notify subscribers
    cache.set(key, value)
    emit(key)

    // safeStorage handles quota errors internally
    storage.setItem(key, JSON.stringify(value))
  }

  /**
   * Remove a key from storage and cache, notifying subscribers
   */
  function removeStorage(key: string): void {
    cache.delete(key)
    storage.removeItem(key)
    emit(key)
  }

  /**
   * Reset a key to a default value atomically - updates cache before emitting
   * to avoid timing issues with useSyncExternalStore snapshots
   */
  function resetStorage<T>(key: string, defaultValue: T): void {
    const prev = cache.get(key)
    if (isEqual(prev, defaultValue)) return

    cache.set(key, defaultValue) // Set default BEFORE emit
    storage.removeItem(key)
    emit(key)
  }

  /**
   * Clear all cached data (useful for testing).
   * Emits to subscribers - components should handle cache miss in getSnapshot
   * by reseeding with their initialValue.
   */
  function clearAll(): void {
    const keys = [...cache.keys()]
    for (const key of keys) {
      cache.delete(key)
      storage.removeItem(key)
      emit(key)
    }
  }

  /**
   * Clear specified keys from cache and storage.
   * Emits to subscribers - components should handle cache miss in getSnapshot
   * by reseeding with their initialValue.
   */
  function clearKeys(keys: string[]): void {
    for (const key of keys) {
      cache.delete(key)
      storage.removeItem(key)
      emit(key)
    }
  }

  /**
   * Clear keys matching a prefix from cache and storage.
   * Emits to subscribers - components should handle cache miss in getSnapshot
   * by reseeding with their initialValue.
   */
  function clearKeysByPrefix(prefix: string): void {
    const keysToRemove = storage.getKeys().filter(key => key.startsWith(prefix))
    for (const key of keysToRemove) {
      cache.delete(key)
      storage.removeItem(key)
      emit(key)
    }
  }

  /**
   * Get all items whose keys start with a prefix
   */
  function getItemsByPrefix<T>(prefix: string): T[] {
    const items: T[] = []
    for (const key of storage.getKeys()) {
      if (key.startsWith(prefix)) {
        const raw = storage.getItem(key)
        if (raw != null) {
          try {
            items.push(JSON.parse(raw) as T)
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
    return items
  }

  return {
    writeStorage,
    readStorage,
    removeStorage,
    resetStorage,
    subscribe,
    cache,
    clearAll,
    clearKeys,
    clearKeysByPrefix,
    getItemsByPrefix,
  }
}

/**
 * @generated SignedSource<<fd14c69b04a87f87b602fa1d314b725a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type CrossReferencedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly databaseId: number | null | undefined;
  readonly innerSource: {
    readonly __typename: string;
    readonly " $fragmentSpreads": FragmentRefs<"IssueLink">;
  };
  readonly referencedAt: string;
  readonly willCloseTarget: boolean;
  readonly " $fragmentType": "CrossReferencedEvent";
};
export type CrossReferencedEvent$key = {
  readonly " $data"?: CrossReferencedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"CrossReferencedEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CrossReferencedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "referencedAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "willCloseTarget",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": "innerSource",
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "source",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "__typename",
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "IssueLink"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "CrossReferencedEvent",
  "abstractKey": null
};

(node as any).hash = "bf18172c8121dbfd81a919c9ada72a5c";

export default node;

import {LinkExternalIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {getGroupCreatedAt} from '../utils/get-group-created-at'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {CrossReferencedEvent$key} from './__generated__/CrossReferencedEvent.graphql'
import styles from './CrossReferencedEvent.module.css'
import {IssueLink} from './IssueLink'
import {Ago} from './row/Ago'
import {TimelineRow} from './row/TimelineRow'

export type ReferenceTypes = 'issues' | 'prs' | 'mixed'

type RollupGroup = CrossReferencedEvent$key & {source?: {__typename: string}; createdAt?: string}
type RollupGroups = Record<string, RollupGroup[]>

type CrossReferencedEventProps = {
  queryRef: CrossReferencedEvent$key & {createdAt?: string}
  rollupGroup?: RollupGroups
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  repositoryId: string
  ownerLogin: string
}

type sourceType = 'Issue' | 'PullRequest'

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
const CrossReferencedEventFragment = graphql`
  fragment CrossReferencedEvent on CrossReferencedEvent {
    referencedAt
    willCloseTarget
    databaseId
    innerSource: source {
      __typename
      ...IssueLink
    }
    actor {
      ...TimelineRowEventActor
    }
  }
`

export function CrossReferencedEvent({
  queryRef,
  issueUrl,
  highlightedEventId,
  onLinkClick,
  refAttribute,
  rollupGroup,
  repositoryId,
  ownerLogin,
}: CrossReferencedEventProps): React.ReactElement {
  const {actor, referencedAt, willCloseTarget, innerSource, databaseId} = useFragment(
    CrossReferencedEventFragment,
    queryRef,
  )

  const isIssue = innerSource.__typename === 'Issue'
  const isPullRequest = innerSource.__typename === 'PullRequest'

  if (!isIssue && !isPullRequest) {
    return <></>
  }

  const rolledUpGroup = rollupGroup && rollupGroup['CrossReferencedEvent'] ? rollupGroup['CrossReferencedEvent'] : []
  const hasMixedReferenceTypes = rolledUpGroup.some(item => item.source?.__typename !== innerSource.__typename)

  const message = buildMessage(innerSource.__typename, willCloseTarget, rolledUpGroup?.length, hasMixedReferenceTypes)

  const highlighted = String(databaseId) === highlightedEventId

  const itemsToRender = rolledUpGroup.length === 0 ? [queryRef] : rolledUpGroup
  const eventCreatedAt = getGroupCreatedAt(queryRef.createdAt, rolledUpGroup)

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={referencedAt}
      showAgoTimestamp={false}
      deepLinkUrl={issueUrl}
      onLinkClick={onLinkClick}
      leadingIcon={LinkExternalIcon}
    >
      <TimelineRow.Main>
        {message}{' '}
        {eventCreatedAt ? (
          <Ago timestamp={new Date(eventCreatedAt)} linkUrl={createIssueEventExternalUrl(issueUrl, databaseId)} />
        ) : null}
      </TimelineRow.Main>
      <TimelineRow.Secondary>
        <section aria-label={LABELS.crossReferencedEvent.sectionLabel}>
          <ul className={styles.crossReferencesList}>
            {itemsToRender.map((item, index) => (
              <CrossReferenceItem
                // eslint-disable-next-line @eslint-react/no-array-index-key
                key={`${databaseId}_${index}`}
                event={item}
                targetRepositoryId={repositoryId}
                targetOwnerLogin={ownerLogin}
              />
            ))}
          </ul>
        </section>
      </TimelineRow.Secondary>
    </TimelineRow>
  )
}

function CrossReferenceItem({
  event,
  targetRepositoryId,
  targetOwnerLogin,
}: {
  event: CrossReferencedEvent$key
  targetRepositoryId: string
  targetOwnerLogin: string
}) {
  const {innerSource} = useFragment(CrossReferencedEventFragment, event)
  return (
    <li style={{listStyle: 'none'}}>
      <IssueLink data={innerSource} targetRepositoryId={targetRepositoryId} targetOwnerLogin={targetOwnerLogin} />
    </li>
  )
}

function buildMessage(
  sourceType: sourceType,
  willCloseTarget: boolean,
  rolledUpGroupLength: number,
  mixedReferenceTypes: boolean,
) {
  if (willCloseTarget) {
    return LABELS.timeline.linkedAClosingPR
  }
  if (rolledUpGroupLength === 0 || mixedReferenceTypes) {
    return LABELS.timeline.mentionedThisIn
  }
  if (sourceType === 'Issue') {
    return `${LABELS.timeline.mentionedThisIn} in ${rolledUpGroupLength} issues`
  } else {
    return `${LABELS.timeline.mentionedThisIn} in ${rolledUpGroupLength} pull requests`
  }
}

/**
 * @generated SignedSource<<92f701dc7cda70b169e77326fc0e1ada>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type DemilestonedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly milestone: {
    readonly url: string;
  } | null | undefined;
  readonly milestoneTitle: string;
  readonly " $fragmentType": "DemilestonedEvent";
};
export type DemilestonedEvent$key = {
  readonly " $data"?: DemilestonedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"DemilestonedEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DemilestonedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "milestoneTitle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Milestone",
      "kind": "LinkedField",
      "name": "milestone",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "url",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "DemilestonedEvent",
  "abstractKey": null
};

(node as any).hash = "6ddaa1761b9fc007b083bf94d27ea749";

export default node;

import {MilestoneIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {DemilestonedEvent$key} from './__generated__/DemilestonedEvent.graphql'
import type {MilestonedEvent$key} from './__generated__/MilestonedEvent.graphql'
import styles from './DemilestonedEvent.module.css'
import {RolledupMilestonedEvent} from './RolledupMilestonedEvent'
import {TimelineRow} from './row/TimelineRow'

type DemilestonedEventProps = {
  queryRef: DemilestonedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  rollupGroup?: Record<string, Array<MilestonedEvent$key | DemilestonedEvent$key>>
}

export function DemilestonedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  rollupGroup,
}: DemilestonedEventProps): React.ReactElement {
  const {actor, createdAt, milestoneTitle, milestone, databaseId} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment DemilestonedEvent on DemilestonedEvent {
        databaseId
        createdAt
        actor {
          ...TimelineRowEventActor
        }
        milestoneTitle
        milestone {
          url
        }
      }
    `,
    queryRef,
  )

  const highlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={MilestoneIcon}
    >
      <TimelineRow.Main>
        {rollupGroup ? (
          <RolledupMilestonedEvent rollupGroup={rollupGroup} />
        ) : (
          <>
            {LABELS.timeline.removedFromMilestone}
            {getWrappedMilestoneLink(milestone?.url, milestoneTitle)}
            {LABELS.timeline.milestone}{' '}
          </>
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

export function getWrappedMilestoneLink(
  url: string | undefined,
  title: string,
  addDelimiter?: boolean,
): React.ReactElement {
  if (url !== undefined) {
    return getMilestoneLink(url, title, addDelimiter)
  }
  return <Tooltip text={LABELS.timeline.milestoneDeleted}>{getMilestoneLink(url, title, addDelimiter)}</Tooltip>
}

function getMilestoneLink(url: string | undefined, title: string, addDelimiter?: boolean): React.ReactElement {
  return (
    <>
      {' '}
      <Link href={url} inline className={styles.milestoneLink}>
        {title}
      </Link>
      {addDelimiter && ','}{' '}
    </>
  )
}

/**
 * @generated SignedSource<<55ca947077813ea1cef55d0e69176ca8>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
import type { FragmentRefs } from "relay-runtime";
export type DisconnectedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly subject: {
    readonly isDraft?: boolean;
    readonly isInMergeQueue?: boolean;
    readonly number?: number;
    readonly repository?: {
      readonly name: string;
      readonly owner: {
        readonly login: string;
      };
    };
    readonly state?: PullRequestState;
    readonly title?: string;
    readonly url?: string;
  };
  readonly " $fragmentType": "DisconnectedEvent";
};
export type DisconnectedEvent$key = {
  readonly " $data"?: DisconnectedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"DisconnectedEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DisconnectedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "subject",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "title",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "url",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "number",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "state",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "isDraft",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "isInMergeQueue",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "Repository",
              "kind": "LinkedField",
              "name": "repository",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": null,
                  "kind": "LinkedField",
                  "name": "owner",
                  "plural": false,
                  "selections": [
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "login",
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "type": "PullRequest",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "DisconnectedEvent",
  "abstractKey": null
};

(node as any).hash = "aea0d6e09caea75d847e9bd6ecfc11ce";

export default node;

import {useGetHovercardAttributesForType} from '@github-ui/hovercards/use-get-hovercard-attributes-for-type'
import {useIssueState} from '@github-ui/issue-pr-state'
import type {PullRequestStateType} from '@github-ui/issue-pr-state/constants'
import {Link} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {DisconnectedEvent$key} from './__generated__/DisconnectedEvent.graphql'
import styles from './DisconnectedEvent.module.css'
import {TimelineRow} from './row/TimelineRow'

type DisconnectedEventProps = {
  queryRef: DisconnectedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function DisconnectedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: DisconnectedEventProps): React.ReactElement {
  const {actor, createdAt, subject, databaseId} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment DisconnectedEvent on DisconnectedEvent {
        databaseId
        actor {
          ...TimelineRowEventActor
        }
        createdAt
        subject {
          ... on PullRequest {
            title
            url
            number
            state
            isDraft
            isInMergeQueue
            repository {
              name
              owner {
                login
              }
            }
          }
        }
      }
    `,
    queryRef,
  )

  const {title, number, url, isDraft, isInMergeQueue, state, repository} = subject || {}

  const getHovercardAttributesForType = useGetHovercardAttributesForType()
  const {sourceIcon: getSourceIcon} = useIssueState({state: state as PullRequestStateType})
  const PullStateIcon = getSourceIcon('PullRequest', isDraft, isInMergeQueue)
  const highlighted = String(databaseId) === highlightedEventId

  const hovercardAttributes =
    repository && number
      ? getHovercardAttributesForType('pull_request', {
          owner: repository.owner.login,
          repo: repository.name,
          pullRequestNumber: number,
        })
      : {}

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={PullStateIcon}
    >
      <TimelineRow.Main>
        {LABELS.timeline.removedLinkedPR}
        {/* eslint-disable-next-line react-hooks/static-components */}
        <PullStateIcon className="ml-1 mr-1" />
        <Link href={url} target="_blank" {...hovercardAttributes} inline className={styles.disconnectedPullRequestLink}>
          {`${title} #${number}`}
        </Link>
      </TimelineRow.Main>
    </TimelineRow>
  )
}

/**
 * @generated SignedSource<<f22957dc0d5d7be5778ee97d1ed7decf>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type EventActor$data = {
  readonly __typename: string;
  readonly avatarUrl: string;
  readonly displayName?: string;
  readonly isAgent?: boolean;
  readonly isCopilot?: boolean;
  readonly login: string;
  readonly name?: string | null | undefined;
  readonly profileResourcePath: string | null | undefined;
  readonly " $fragmentType": "EventActor";
};
export type EventActor$key = {
  readonly " $data"?: EventActor$data;
  readonly " $fragmentSpreads": FragmentRefs<"EventActor">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "EventActor",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "size",
          "value": 64
        }
      ],
      "kind": "ScalarField",
      "name": "avatarUrl",
      "storageKey": "avatarUrl(size:64)"
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "login",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "profileResourcePath",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isCopilot",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isAgent",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "displayName",
          "storageKey": null
        }
      ],
      "type": "Bot",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "User",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "EnterpriseUserAccount",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": (v0/*: any*/),
      "type": "Mannequin",
      "abstractKey": null
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};
})();

(node as any).hash = "53370c230b8754d5a3a1a578c07e0cd1";

export default node;

import {CopilotAvatar} from '@github-ui/copilot-avatar'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {hovercardAttributesForActor} from '@github-ui/hovercards'
import {ProfileReference} from '@github-ui/profile-reference'
import {Link} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import {LABELS} from '../../constants/labels'
import {VALUES} from '../../constants/values'
import type {EventActor$key} from './__generated__/EventActor.graphql'
import {GhostActor} from './GhostActor'
import styles from './row.module.css'

type EventActorProps = {
  actor: EventActor$key | null
} & SharedProps

type EventActorPropsInternal = {
  actor: EventActor$key
} & SharedProps

type SharedProps = {
  showAvatarOnly: boolean
  isAgent?: boolean
  displayName?: string
}

type EventActorBaseProps = {
  login?: string
  profileName?: string | null
  avatarUrl: string
  profileResourcePath?: string
  isCopilot?: boolean
  isUser?: boolean
} & SharedProps

export function EventActor({actor, ...props}: EventActorProps): React.ReactElement {
  return actor ? <EventActorInternal actor={actor} {...props} /> : <GhostActor />
}

function EventActorInternal({actor, ...props}: EventActorPropsInternal): React.ReactElement {
  const {login, name, avatarUrl, isCopilot, profileResourcePath, __typename, isAgent, displayName} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment EventActor on Actor {
        avatarUrl(size: 64)
        login
        profileResourcePath
        __typename
        ... on Bot {
          isCopilot
          isAgent
          displayName
        }
        ... on User {
          name
        }
        ... on EnterpriseUserAccount {
          name
        }
        ... on Mannequin {
          name
        }
      }
    `,
    actor,
  )

  const isUser = ['User', 'Organization'].includes(__typename)

  return (
    <EventActorBase
      login={login}
      profileName={name}
      avatarUrl={avatarUrl}
      profileResourcePath={profileResourcePath ?? undefined}
      isCopilot={isCopilot}
      isUser={isUser}
      isAgent={isAgent}
      displayName={displayName}
      {...props}
    />
  )
}

function EventActorBase({
  login,
  profileName,
  avatarUrl,
  profileResourcePath,
  showAvatarOnly,
  isCopilot = false,
  isUser = true,
  isAgent = false,
  displayName = '',
}: EventActorBaseProps): React.ReactElement {
  if (login === VALUES.ghost.login) {
    return <span>{LABELS.repositoryOwner} </span>
  } else if (!login) {
    return <span>{VALUES.ghost.login} </span>
  }

  const useHovercard = isUser || isCopilot || isAgent
  const getActorDisplayName = () => {
    if (isCopilot) return VALUES.copilot.displayName
    if (isAgent && displayName) return displayName
    return login
  }
  const actorDisplayName = getActorDisplayName()

  return (
    <div className={styles.eventActorContainer}>
      <Link
        data-testid="actor-link"
        role="link"
        href={profileResourcePath}
        {...(useHovercard ? hovercardAttributesForActor(login, {isCopilot, isAgent}) : {})}
        className={styles.eventActorLink}
        muted
      >
        {isCopilot ? (
          <CopilotAvatar size={'small'} className={styles.alignSelfCenter} />
        ) : (
          <GitHubAvatar src={avatarUrl} size={16} className={styles.alignSelfCenter} />
        )}
        {!showAvatarOnly && (
          <span className={styles.eventProfileReference}>
            <ProfileReference login={actorDisplayName} profileName={profileName} isAgent={isAgent} />
          </span>
        )}
      </Link>
    </div>
  )
}

export const EVENTS = {
  event: 'event',
  issueComment: 'issuecomment',
  pullRequestComment: 'discussion_r',
  pullRequestReview: 'pullrequestreview',
}

export const PULL_REQUEST_EVENTS = [
  `#${EVENTS.event}`,
  `#${EVENTS.issueComment}`,
  `#${EVENTS.pullRequestComment}`,
  `#${EVENTS.pullRequestReview}`,
]

export const ISSUE_EVENTS = [`#${EVENTS.issueComment}`, `#${EVENTS.event}`]

import {AlertIcon} from '@primer/octicons-react'

import {TimelineRow} from './row/TimelineRow'

export function FallbackEvent(): React.ReactElement {
  return (
    <TimelineRow
      showActorName={false}
      showAgoTimestamp={false}
      highlighted={false}
      actor={null}
      createdAt={''}
      deepLinkUrl={''}
      leadingIcon={AlertIcon}
    >
      <TimelineRow.Main>
        <span>Could not load event</span>
      </TimelineRow.Main>
    </TimelineRow>
  )
}

/**
 * Formats an issue/PR reference based on the repository context.
 *
 * @param source - Source repository information containing number, ownerLogin, repoId, and repoName
 * @param targetRepoId - The target repository ID for comparison
 * @param targetOwnerLogin - The target owner login for comparison
 * @returns Formatted reference string:
 *   - `#123` if same repository
 *   - `repo-name#123` if different repository but same owner
 *   - `owner/repo-name#123` if different owner
 *
 * @example
 * ```typescript
 * formatIssueReference(
 *   { number: 123, ownerLogin: 'monalisa', repoId: '123456', repoName: 'smile' },
 *   '654321',
 *   'github'
 * ) // Returns: "monalisa/smile#123"
 * ```
 */
export function formatIssueReference(
  source: {
    number: number
    ownerLogin: string
    repoId: string
    repoName: string
  },
  targetRepoId: string | undefined,
  targetOwnerLogin: string | undefined,
): string {
  if (source.repoId === targetRepoId) {
    return `#${source.number}`
  }

  if (source.ownerLogin === targetOwnerLogin) {
    return `${source.repoName}#${source.number}`
  }

  return `${source.ownerLogin}/${source.repoName}#${source.number}`
}

import type {TurboFrameClickEvent} from '@github/turbo'
import {getCachedNode, setCachedNode} from './cache'
import {
  addNewScripts,
  addNewStylesheets,
  getTurboCacheNodes,
  getChangedTrackedKeys,
  replaceElements,
  waitForStylesheets,
  dispatchTurboReload,
  isTurboFrame,
  isSameRepo,
  isSameProfile,
  dispatchTurboRestored,
} from './utils'
import isHashNavigation from '@github-ui/is-hash-navigation'
import {setTitle} from '@github-ui/document-metadata'
import {ssrSafeWindow, ssrSafeDocument} from '@github-ui/ssr-utils'
import {startSoftNav, updateFrame} from '@github-ui/soft-nav/state'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import type {FetchResponse} from '@github/turbo/dist/types/http/fetch_response'
import {reactNavigateIfPossible} from './react'
import {updateUrlHash} from '@github-ui/history'

let frameNavigation = false
let fetchResponse: FetchResponse | null
let savedFragmentHash = ''

const navigatingBetweenDifferentEntities = (event: TurboFrameClickEvent) => {
  if (!(event.target instanceof HTMLElement)) return

  const frameContainer = event.target.closest('[data-turbo-frame]')
  const repoContainer = event.target.closest('#js-repo-pjax-container')
  const url = new URL(event.detail.url, window.location.origin)
  const userProfileContainer = event.target.closest('#user-profile-frame')

  return (
    // Don't frame navigate if going to a different repo, since the frame will not
    // load the new repo's header.
    (repoContainer && frameContainer && !isSameRepo(url.pathname, location.pathname)) ||
    // Don't frame navigate if going to a different user profile, since the frame
    // will not load the new user's side panel information.
    (userProfileContainer && !isSameProfile(url.pathname, location.pathname))
  )
}

ssrSafeDocument?.addEventListener('turbo:frame-click', function (event) {
  if (!(event.target instanceof HTMLElement)) return

  if (event.detail.originalEvent?.defaultPrevented) {
    event.preventDefault()
    return
  }

  if (reactNavigateIfPossible(event)) return

  // https://github.com/hotwired/turbo/issues/539
  // If we are doing a hash navigation, we want to prevent Turbo from performing a visit
  // so it won't mess with focus styles.
  if (isHashNavigation(location.href, event.detail.url)) {
    event.preventDefault()
    return
  }

  if (navigatingBetweenDifferentEntities(event)) {
    dispatchTurboReload('repo_mismatch')
    event.target.removeAttribute('data-turbo-frame')
    event.preventDefault()
  }

  // Here is where Turbo frame navigation starts.
  if (!event.defaultPrevented) {
    startSoftNav('turbo.frame')
  }
})

ssrSafeDocument?.addEventListener('turbo:before-fetch-response', event => {
  fetchResponse = event.detail.fetchResponse

  if (isTurboFrame(event.target)) {
    // Save the fragment hash before Turbo's loadResponse() strips it from frame.src.
    // HTTP responses don't include fragments, so Turbo overwrites src with a hash-less URL.
    // See https://github.com/hotwired/turbo/issues/598
    const frameSrc = (event.target as HTMLElement).getAttribute('src') || ''
    try {
      savedFragmentHash = new URL(frameSrc, window.location.origin).hash
    } catch {
      savedFragmentHash = ''
    }
    setCachedNode(window.location.href, getTurboCacheNodes(document))
  }
})

// Before rendering the new page (frame), we need to make sure the body is ready with
// all the classes necessary. We do that by replacing the current body's classes with
// classes that come from the `turbo-body-classes` meta tag.
// We also are ready to add new scripts and stylesheets to the head, since that won't be
// modified by the frame render.
// We don't update the title here because it will be overridden by the frame.
// We also don't update transients because it will mess with the B/F cache.
ssrSafeDocument?.addEventListener('turbo:before-frame-render', async event => {
  // preventDefault MUST be the first thing in this event, otherwise rendering will NOT be paused.
  event.preventDefault()

  const {resume, newFrame} = event.detail

  frameNavigation = true

  if (!fetchResponse) return

  const responseHTML = await fetchResponse.responseHTML
  const responseLocation = fetchResponse.location

  const parsedHTML = new DOMParser().parseFromString(responseHTML ?? '', 'text/html')
  fetchResponse = null

  const sourceFrame = event.target as HTMLElement
  const targetFrames = parsedHTML.querySelectorAll<HTMLElement>('turbo-frame')
  const matchingFrame = [...targetFrames].find(frame => frame.id === sourceFrame?.id)
  const changedKeys = getChangedTrackedKeys(parsedHTML)

  // if the frames or tracked elements don't match, force a reload to the destination page otherwise
  // the user will get an empty page or a page with the wrong assets.
  if (!matchingFrame || changedKeys.length > 0) {
    dispatchTurboReload(`tracked_element_mismatch-${changedKeys.join('-')}`)
    window.location.href = responseLocation.href
    return
  }

  setCachedNode(responseLocation.href, getTurboCacheNodes(parsedHTML))

  addNewStylesheets(parsedHTML)
  addNewScripts(parsedHTML)
  replaceElements(parsedHTML)
  replaceFrameClasses(sourceFrame, matchingFrame)

  // We have to treat stylesheets as a blocking resource, so we wait for them to be loaded before continuing
  // the frame render.
  await waitForStylesheets()

  resume(undefined)

  // Turbo's loadResponse() strips the URL fragment from frame.src (HTTP responses
  // don't include fragments), so changeHistory() pushes a hash-less URL.
  // Restore the saved fragment hash via replaceState.
  // See https://github.com/hotwired/turbo/issues/598
  const hash = savedFragmentHash
  savedFragmentHash = ''
  if (hash.length > 1) {
    updateUrlHash(hash)
  }

  if (shouldScrollToTop(newFrame) && hash.length <= 1) {
    window.scrollTo(0, 0)
  }

  replaceTransientTags()
  // If we replace classes too early there may be some jitter when navigating to/from full-width pages.
  replaceBodyAttributesFromRequest(parsedHTML)
})

ssrSafeWindow?.addEventListener('popstate', () => {
  // When going back/forward, we need to restore elements that were replaced by us outside of the frame.
  // popstate runs before turbo actually restores the page, so we have to wait for the next load to guarantee
  // that our restoration is done after turbo's.
  document.addEventListener(
    'turbo:load',
    () => {
      const elements = getCachedNode()?.replacedElements || []

      replaceElements(document, elements)
      replaceTitle()
      dispatchTurboRestored()
    },
    {once: true},
  )
})

// At this point, Turbo finished updating things from its snapshot, so we can manually
// updates whatever is necessary from the navigation.
ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.SUCCESS, () => {
  // This is a safeguard for back/forwards navigation. If the user clicks those buttons.
  // Turbo will NOT trigger `turbo:before-fetch-response`, which would make the `body` stale.
  // Since we are restoring a page from the cache, `turboPageNodes` will be populated, so it
  // will know what are the `body` classes to restore.
  replaceBodyClassesFromCachedNodes()

  if (!frameNavigation) return

  frameNavigation = false
  replaceTitle()
  replaceTransientTags()
  updateFrame()
})

const replaceBodyAttributesFromRequest = (html: Document) => {
  const classes = html.querySelector<HTMLMetaElement>('meta[name=turbo-body-classes]')?.content
  const disable = html.querySelector<HTMLMetaElement>('meta[name=disable-turbo]')?.content === 'true'

  if (disable) {
    document.querySelector('[data-turbo-body]')?.setAttribute('data-turbo', 'false')
  }

  if (!classes) return

  document.body.setAttribute('class', classes)
  document.querySelector('[data-turbo-body]')?.setAttribute('class', classes)
}

const replaceBodyClassesFromCachedNodes = () => {
  // If the navigation is a full-page reload, `turboPageNodes` will be reset
  // and this will be a noop.
  const classes = getCachedNode()?.bodyClasses

  if (!classes) return

  document.body.setAttribute('class', classes)
  document.querySelector('[data-turbo-body]')?.setAttribute('class', classes)
}

const replaceTitle = () => {
  const title = getCachedNode()?.title

  if (title) {
    setTitle(title)
  }
}

// Replace all `data-turbo-transient` elements
const replaceTransientTags = () => {
  const cached = getCachedNode()?.transients
  if (!cached) return

  for (const el of document.querySelectorAll('head [data-turbo-transient]')) {
    el.remove()
  }

  for (const el of cached) {
    // title, scripts and stylesheets have their own logic to be added
    // so here we'll only deal with the rest of the transient elements
    // This is just a safeguard in case someone adds `data-turbo-transient`
    // to one of those elements.
    if (!el.matches('title, script, link[rel=stylesheet]')) {
      el.setAttribute('data-turbo-transient', '')
      document.head.append(el)
    }
  }
}

const replaceFrameClasses = (oldFrame: HTMLElement | undefined, newFrame: HTMLElement) => {
  if (!oldFrame) return

  oldFrame.className = newFrame.className
}

const shouldScrollToTop = (frame: HTMLElement) =>
  frame.getAttribute('data-turbo-skip-scroll') !== 'true' && frame.getAttribute('data-turbo-action') === 'advance'

type RollupGroup = {createdAt?: string}

export function getGroupCreatedAt(createdAt: string | undefined, rollupGroup: RollupGroup[]) {
  if (rollupGroup.length === 0) {
    return createdAt
  }
  let latest = undefined

  if (createdAt) {
    latest = new Date(createdAt).valueOf()
  }

  for (const event of rollupGroup) {
    if (event.createdAt) {
      const current = new Date(event.createdAt).valueOf()
      if (!latest || current > latest) {
        latest = current
      }
    }
  }

  return latest
}

import {VALUES} from '../constants/values'

export function getLockString(lockReason: string | null | undefined) {
  let lockReasonString = ''
  if (lockReason) {
    const lockReasonKey = `${lockReason}` as keyof typeof VALUES.lockedReasonStrings
    if (lockReasonKey in VALUES.lockedReasonStrings) {
      lockReasonString = VALUES.lockedReasonStrings[lockReasonKey]
    } else {
      throw new Error('Invalid lock reason')
    }
  }
  return lockReasonString
}

import {VALUES} from '../../constants/values'

export function GhostActor(): React.ReactElement {
  return <span>{VALUES.ghost.login} </span>
}

import {useCallback, useEffect, useRef} from 'react'

import {CommandEvent, CommandEventHandlersMap} from '../command-event'
import {CommandId} from '../commands'
import {useRegisterCommands} from '../commands-registry'
import {recordCommandTriggerEvent} from '../metrics'
import {useDetectConflicts} from '../use-detect-conflicts'
import {useOnKeyDown} from '../use-on-key-down'
import {getActiveModal, isInsideModal} from '../utils'

export interface GlobalCommandsProps {
  /** Map of command IDs to the corresponding event handler. */
  commands: CommandEventHandlersMap
}

/**
 * There's no context for global commands because they can be defined in any react app on the page. So to be able to
 * trigger them without keyboard events, we emit and listen for custom DOM events instead.
 */
const customDomEventName = 'ui-command-trigger'

/** Trigger a global command without a keyboard event. */
export function dispatchGlobalCommand(commandId: CommandId, domEvent: KeyboardEvent | MouseEvent) {
  document.dispatchEvent(
    new CustomEvent(customDomEventName, {
      detail: {
        commandId,
        domEvent,
      },
    }),
  )
}

/**
 * Provide command handlers that are activatable when focus is anywhere on the current page, including outside this
 * React app.
 *
 * @example
 * <GlobalCommands commands={{'issues:navigateToCode': navigateToCode}} />
 */
export const GlobalCommands = ({commands}: GlobalCommandsProps) => {
  const element = useRef<HTMLDivElement>(null)

  const triggerCommand = useCallback(
    <T extends CommandId>(commandId: T, domEvent: KeyboardEvent | MouseEvent) => {
      if (domEvent instanceof KeyboardEvent) {
        // When a modal dialog is open, global commands should not be able to trigger 'underneath' that dialog. This
        // prevents unexpected things from happening in the page behind the active modal. For example, you shouldn't
        // be able to navigate the underlying page when there is a dialog taking over the whole view.
        const activeModal = getActiveModal()
        if (activeModal && !isInsideModal(activeModal, element.current)) return false
      }

      const handler = commands[commandId]

      if (handler) {
        const event = new CommandEvent(commandId)
        try {
          handler(event)
        } finally {
          recordCommandTriggerEvent(event, domEvent)
        }
      } else {
        // Return false to indicate the command was not handled, allowing the event to propagate
        // and the browser default behavior to occur (e.g., Cmd+S to save the page)
        return false
      }
    },
    [commands],
  )

  const onKeyDown = useOnKeyDown(CommandEventHandlersMap.keys(commands), triggerCommand)

  useDetectConflicts('global', commands)

  useRegisterCommands(commands)

  useEffect(() => {
    // Types for this are a massive pain because _anything_ can emit an event with this name
    const onCustomEvent = (event: Event) => {
      const detail = 'detail' in event && typeof event.detail === 'object' ? event.detail : undefined
      if (!detail) return

      const commandId =
        'commandId' in detail && typeof detail.commandId === 'string' && CommandId.is(detail.commandId)
          ? detail.commandId
          : undefined
      const domEvent =
        'domEvent' in detail && (detail.domEvent instanceof KeyboardEvent || detail.domEvent instanceof MouseEvent)
          ? detail.domEvent
          : undefined
      if (!commandId || !domEvent) return

      triggerCommand(commandId, domEvent)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener(customDomEventName, onCustomEvent)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener(customDomEventName, onCustomEvent)
    }
  }, [onKeyDown, triggerCommand, element])

  return <div ref={element} className="d-none" />
}

export type HighlightedEvent = {
  id: string
  prefix: string
}

export function getHighlightedEvent(highlightedEventText?: string) {
  const highlightedEventType = highlightedEventText?.split('-')[0]
  const highlightedEventId = highlightedEventText?.split('-')[1]
  const highlightedEvent: HighlightedEvent | undefined =
    highlightedEventId && highlightedEventType
      ? {
          id: highlightedEventId,
          prefix: highlightedEventType,
        }
      : undefined

  return highlightedEvent
}

export function getHighlightedEventText(hash: string, validEvents: string[]) {
  if (hash.length > 1) {
    const splitted = hash.split('-')
    if (splitted.length !== 2) return undefined
    if (!splitted[0] || !validEvents.includes(splitted[0])) return undefined
    // remove the hash
    return hash.substring(1)
  }

  return undefined
}

import {navigator, session} from '@github/turbo'
import {currentState} from '@github-ui/history'
import {currentAppId} from '@github-ui/app-uuid'

type State = Record<string, unknown> & {
  turbo?: {restorationIdentifier: string}
  turboCount?: number
  appId?: string
}

// Turbo should restore the page on b/f navigation whenever we cross app boundaries or are going from rails to rails.
session.history.shouldRestore = (state?: State) => {
  const currentApp = currentAppId()
  const stateAppId = state?.appId
  return currentApp !== stateAppId || (stateAppId === 'rails' && currentApp === 'rails') || !stateAppId
}

// keep Turbo's history up to date with the browser's in case code calls native history API's directly
const patchHistoryApi = (name: 'replaceState' | 'pushState') => {
  // eslint-disable-next-line no-restricted-globals
  const oldHistory = history[name]

  // eslint-disable-next-line no-restricted-globals
  history[name] = function (this: History, state?: State, unused?: string, url?: string | URL | null) {
    // we need to merge the state from turbo with the state given to pushState in case others are adding data to the state
    function oldHistoryWithMergedState(
      this: History,
      turboState: State,
      turboUnused: string,
      turboUrl?: string | URL | null,
    ) {
      const currentTurboCount = currentState().turboCount || 0
      const isTurboNav = name === 'pushState' && state?.turbo

      // The only places that actively sets the appId are:
      //  1. during ReactAppElement connectedCallback.
      //  2. when turbo is pushing a state (turbo navs)
      // We want to make sure the app registers itself in the history state and propagate it between
      // soft navs and other state changes.
      const appId = isTurboNav ? 'rails' : state?.appId || currentState().appId

      // Only turbo navs have the `turbo` key when pushing state.
      const turboCount = isTurboNav ? currentTurboCount + 1 : currentTurboCount

      const mergedState = {...state, ...turboState, turboCount, appId}
      oldHistory.call(this, mergedState, turboUnused, turboUrl)
    }

    navigator.history.update(
      oldHistoryWithMergedState,
      new URL(url || location.href, location.href),
      state?.turbo?.restorationIdentifier,
    )
  }
}

patchHistoryApi('replaceState')
patchHistoryApi('pushState')

/**
 * @generated SignedSource<<baf02ac12c5b84c0e3c1b38864639ec4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
export type IssueFieldDataType = "DATE" | "NUMBER" | "SINGLE_SELECT" | "TEXT" | "%future added value";
import type { FragmentRefs } from "relay-runtime";
export type IssueFieldAddedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly color: string | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly issueField: {
    readonly dataType?: IssueFieldDataType;
    readonly name?: string;
  } | null | undefined;
  readonly value: string | null | undefined;
  readonly " $fragmentType": "IssueFieldAddedEvent";
};
export type IssueFieldAddedEvent$key = {
  readonly " $data"?: IssueFieldAddedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueFieldAddedEvent">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "dataType",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = [
  (v1/*: any*/),
  (v0/*: any*/)
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueFieldAddedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "issueField",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
            (v1/*: any*/)
          ],
          "type": "IssueFieldText",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v2/*: any*/),
          "type": "IssueFieldDate",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v2/*: any*/),
          "type": "IssueFieldNumber",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v2/*: any*/),
          "type": "IssueFieldSingleSelect",
          "abstractKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "value",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "color",
      "storageKey": null
    }
  ],
  "type": "IssueFieldAddedEvent",
  "abstractKey": null
};
})();

(node as any).hash = "fe2a3d8085e9f101dbd25daf1388d92d";

export default node;

import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import type {IssueFieldAddedEvent$key} from './__generated__/IssueFieldAddedEvent.graphql'
import type {IssueFieldChangedEvent$key} from './__generated__/IssueFieldChangedEvent.graphql'
import type {IssueFieldRemovedEvent$key} from './__generated__/IssueFieldRemovedEvent.graphql'
import {IssueFieldEvent, type IssueFieldEventBaseProps} from './IssueFieldEvent'
import {RolledupIssueFieldEvent} from './RolledupIssueFieldEvent'

type IssueFieldEventKey = IssueFieldAddedEvent$key | IssueFieldChangedEvent$key | IssueFieldRemovedEvent$key

type IssueFieldAddedEventProps = IssueFieldEventBaseProps & {
  queryRef: IssueFieldAddedEvent$key & {createdAt?: string}
  rollupGroup?: Record<string, IssueFieldEventKey[]>
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
export const IssueFieldAddedEventFragment = graphql`
  fragment IssueFieldAddedEvent on IssueFieldAddedEvent {
    databaseId
    actor {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...TimelineRowEventActor
    }
    createdAt
    issueField {
      ... on IssueFieldText {
        dataType
        name
      }
      ... on IssueFieldDate {
        name
        dataType
      }
      ... on IssueFieldNumber {
        name
        dataType
      }
      ... on IssueFieldSingleSelect {
        name
        dataType
      }
    }
    value
    color
  }
`

export function IssueFieldAddedEvent({queryRef, rollupGroup, ...props}: IssueFieldAddedEventProps) {
  const {
    actor,
    createdAt,
    issueField,
    value: newValue,
    databaseId,
    color,
  } = useFragment(IssueFieldAddedEventFragment, queryRef)

  const rollupContent = rollupGroup ? (
    <RolledupIssueFieldEvent rollupGroup={rollupGroup} repositoryNameWithOwner={props.repositoryNameWithOwner} />
  ) : undefined

  return (
    <IssueFieldEvent
      actor={actor}
      createdAt={createdAt}
      fieldName={issueField?.name}
      dataType={issueField?.dataType}
      fieldValue={newValue}
      color={color}
      databaseId={databaseId}
      leadingLabel={rollupGroup ? undefined : LABELS.timeline.issueFieldAdded.leading}
      trailingLabel={rollupGroup ? undefined : LABELS.timeline.issueFieldAdded.trailing}
      hasValue={!rollupGroup}
      rollupContent={rollupContent}
      {...props}
    />
  )
}

/**
 * @generated SignedSource<<eed08bc0f1beb553c5d8b3b4531bf3f0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
export type IssueFieldDataType = "DATE" | "NUMBER" | "SINGLE_SELECT" | "TEXT" | "%future added value";
import type { FragmentRefs } from "relay-runtime";
export type IssueFieldChangedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly issueField: {
    readonly dataType?: IssueFieldDataType;
    readonly name?: string;
  } | null | undefined;
  readonly newColor: string | null | undefined;
  readonly newValue: string | null | undefined;
  readonly " $fragmentType": "IssueFieldChangedEvent";
};
export type IssueFieldChangedEvent$key = {
  readonly " $data"?: IssueFieldChangedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueFieldChangedEvent">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "dataType",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = [
  (v1/*: any*/),
  (v0/*: any*/)
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueFieldChangedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "issueField",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
            (v1/*: any*/)
          ],
          "type": "IssueFieldText",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v2/*: any*/),
          "type": "IssueFieldDate",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v2/*: any*/),
          "type": "IssueFieldNumber",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v2/*: any*/),
          "type": "IssueFieldSingleSelect",
          "abstractKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "newColor",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "newValue",
      "storageKey": null
    }
  ],
  "type": "IssueFieldChangedEvent",
  "abstractKey": null
};
})();

(node as any).hash = "8b3afa3d1b9fe7435403b51aadbc4530";

export default node;

import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import type {IssueFieldAddedEvent$key} from './__generated__/IssueFieldAddedEvent.graphql'
import type {IssueFieldChangedEvent$key} from './__generated__/IssueFieldChangedEvent.graphql'
import type {IssueFieldRemovedEvent$key} from './__generated__/IssueFieldRemovedEvent.graphql'
import {IssueFieldEvent, type IssueFieldEventBaseProps} from './IssueFieldEvent'
import {RolledupIssueFieldEvent} from './RolledupIssueFieldEvent'

type IssueFieldEventKey = IssueFieldAddedEvent$key | IssueFieldChangedEvent$key | IssueFieldRemovedEvent$key

type IssueFieldChangedEventProps = IssueFieldEventBaseProps & {
  queryRef: IssueFieldChangedEvent$key & {createdAt?: string}
  rollupGroup?: Record<string, IssueFieldEventKey[]>
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
export const IssueFieldChangedEventFragment = graphql`
  fragment IssueFieldChangedEvent on IssueFieldChangedEvent {
    databaseId
    actor {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...TimelineRowEventActor
    }
    createdAt
    issueField {
      ... on IssueFieldText {
        dataType
        name
      }
      ... on IssueFieldDate {
        name
        dataType
      }
      ... on IssueFieldNumber {
        name
        dataType
      }
      ... on IssueFieldSingleSelect {
        name
        dataType
      }
    }
    newColor
    newValue
  }
`

export function IssueFieldChangedEvent({queryRef, rollupGroup, ...props}: IssueFieldChangedEventProps) {
  const {actor, createdAt, issueField, newValue, newColor, databaseId} = useFragment(
    IssueFieldChangedEventFragment,
    queryRef,
  )

  // If there's a rollup group, render the bundled view
  const rollupContent = rollupGroup ? (
    <RolledupIssueFieldEvent rollupGroup={rollupGroup} repositoryNameWithOwner={props.repositoryNameWithOwner} />
  ) : undefined

  return (
    <IssueFieldEvent
      actor={actor}
      createdAt={createdAt}
      fieldName={issueField?.name}
      dataType={issueField?.dataType}
      fieldValue={newValue}
      color={newColor}
      databaseId={databaseId}
      leadingLabel={rollupGroup ? undefined : LABELS.timeline.issueFieldChanged.leading}
      trailingLabel={rollupGroup ? undefined : LABELS.timeline.issueFieldChanged.trailing}
      hasValue={!rollupGroup}
      rollupContent={rollupContent}
      {...props}
    />
  )
}

import {isFeatureEnabled} from '@github-ui/feature-flags'
import {getFieldTypeOcticon, toIssueFieldType} from '@github-ui/issue-fields-shared/issue-field'
import {IssueFieldSingleSelectValueToken} from '@github-ui/issue-metadata/IssueFieldSingleSelectValueToken'
import {Link} from '@primer/react'

import {createIssueEventExternalUrl} from '../utils/urls'
import type {IssueFieldDataType} from './__generated__/IssueFieldAddedEvent.graphql'
import styles from './IssueFieldEvent.module.css'
import type {TimelineRowEventActor$key} from './row/__generated__/TimelineRowEventActor.graphql'
import {TimelineRow} from './row/TimelineRow'

// Helper function to parse dates from the backend API
// The backend returns ISO 8601 timestamps (e.g., "2026-01-14T00:00:00.000Z")
// but we need to preserve the date portion regardless of the user's timezone.
function stripTimezone(isoString: string | null): Date | null {
  if (!isoString) return null

  // Validate ISO 8601 date format (YYYY-MM-DD at the start)
  const dateMatch = isoString.match(/^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/)
  if (!dateMatch?.groups) return null

  const {year, month, day} = dateMatch.groups
  if (!year || !month || !day) return null

  const yearNum = parseInt(year, 10)
  const monthNum = parseInt(month, 10)
  const dayNum = parseInt(day, 10)

  // Validate numeric ranges
  if (isNaN(yearNum) || isNaN(monthNum) || isNaN(dayNum)) return null
  if (monthNum < 1 || monthNum > 12) return null
  if (dayNum < 1 || dayNum > 31) return null

  // Create a Date at noon UTC to avoid timezone issues
  // This ensures the date displays correctly in any timezone
  const date = new Date(Date.UTC(yearNum, monthNum - 1, dayNum, 12, 0, 0, 0))

  // Final validation: check if Date construction succeeded
  return isNaN(date.getTime()) ? null : date
}

export function getValue(dataType: string, newValue: string | undefined, newColor: string | null | undefined) {
  if (!newValue) {
    return null
  }
  if (dataType === 'SINGLE_SELECT') {
    return <IssueFieldSingleSelectValueToken name={newValue} color={newColor || ''} getTooltipText={() => undefined} />
  } else if (dataType === 'DATE') {
    // Parse the date and format it in UTC to show consistent calendar date
    const date = stripTimezone(newValue)
    if (!date) return 'Invalid Date'
    return date.toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'})
  }
  return newValue
}

export function getSearchLink(
  repositoryNameWithOwner: string | undefined,
  fieldName: string,
  fieldValue: string | undefined,
): string | undefined {
  if (!repositoryNameWithOwner || !fieldValue) {
    return undefined
  }

  const sanitizedFieldName = fieldName.replaceAll(' ', '-')
  const query = encodeURIComponent(`field.${sanitizedFieldName}:"${fieldValue}"`)
  return `/${repositoryNameWithOwner}/issues?q=${query}`
}

export type IssueFieldEventBaseProps = {
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string | null | undefined
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  repositoryNameWithOwner?: string
}

type IssueFieldEventProps = IssueFieldEventBaseProps & {
  fieldValue?: string | null | undefined
  dataType?: IssueFieldDataType
  fieldName?: string
  color?: string | null | undefined
  databaseId?: number | null | undefined
  actor: TimelineRowEventActor$key | null | undefined
  createdAt: string
  trailingLabel?: string
  leadingLabel?: string
  hasValue: boolean
  rollupContent?: React.ReactNode
}

export function IssueFieldEvent({
  fieldValue,
  dataType,
  fieldName,
  color,
  databaseId,
  actor,
  highlightedEventId,
  repositoryNameWithOwner,
  refAttribute,
  createdAt,
  issueUrl,
  onLinkClick,
  trailingLabel,
  leadingLabel,
  hasValue,
  rollupContent,
}: IssueFieldEventProps) {
  const issueFieldsTimelineEventsEnabled = isFeatureEnabled('issue_fields_timeline_events')

  if (rollupContent) {
    if (!issueFieldsTimelineEventsEnabled) {
      return null
    }

    const highlighted = String(databaseId) === highlightedEventId

    return (
      <TimelineRow
        highlighted={highlighted}
        refAttribute={refAttribute}
        actor={actor}
        createdAt={createdAt}
        deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
        onLinkClick={onLinkClick}
        leadingIcon={getFieldTypeOcticon(toIssueFieldType(dataType || 'TEXT'))}
      >
        <TimelineRow.Main>{rollupContent}</TimelineRow.Main>
      </TimelineRow>
    )
  }

  if ((hasValue && !fieldValue) || !dataType || !fieldName || !issueFieldsTimelineEventsEnabled) {
    return null
  }

  const highlighted = String(databaseId) === highlightedEventId

  const value = hasValue ? getValue(dataType, fieldValue || undefined, color) : undefined
  const searchLink = getSearchLink(repositoryNameWithOwner, fieldName, fieldValue || undefined)

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={getFieldTypeOcticon(toIssueFieldType(dataType))}
    >
      <TimelineRow.Main>
        {leadingLabel}
        <div className={styles.issueFieldTokenWrapper}>{fieldName}</div>
        {trailingLabel}
        {value && (
          <div className={styles.issueFieldTokenWrapper}>
            <Link href={searchLink} inline className={styles.issueFieldValueLink}>
              {value}
            </Link>
          </div>
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

/**
 * @generated SignedSource<<1b0e9cc41c482c98cb3fc7c019561362>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
export type IssueFieldDataType = "DATE" | "NUMBER" | "SINGLE_SELECT" | "TEXT" | "%future added value";
import type { FragmentRefs } from "relay-runtime";
export type IssueFieldRemovedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly issueField: {
    readonly dataType?: IssueFieldDataType;
    readonly name?: string;
  } | null | undefined;
  readonly " $fragmentType": "IssueFieldRemovedEvent";
};
export type IssueFieldRemovedEvent$key = {
  readonly " $data"?: IssueFieldRemovedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueFieldRemovedEvent">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "dataType",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = [
  (v1/*: any*/),
  (v0/*: any*/)
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueFieldRemovedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "issueField",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
            (v1/*: any*/)
          ],
          "type": "IssueFieldText",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v2/*: any*/),
          "type": "IssueFieldDate",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v2/*: any*/),
          "type": "IssueFieldNumber",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v2/*: any*/),
          "type": "IssueFieldSingleSelect",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "IssueFieldRemovedEvent",
  "abstractKey": null
};
})();

(node as any).hash = "bc8fca08fc83b97058855f5150dbc0cc";

export default node;

import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import type {IssueFieldAddedEvent$key} from './__generated__/IssueFieldAddedEvent.graphql'
import type {IssueFieldChangedEvent$key} from './__generated__/IssueFieldChangedEvent.graphql'
import type {IssueFieldRemovedEvent$key} from './__generated__/IssueFieldRemovedEvent.graphql'
import {IssueFieldEvent, type IssueFieldEventBaseProps} from './IssueFieldEvent'
import {RolledupIssueFieldEvent} from './RolledupIssueFieldEvent'

type IssueFieldEventKey = IssueFieldAddedEvent$key | IssueFieldChangedEvent$key | IssueFieldRemovedEvent$key

type IssueFieldRemovedEventProps = IssueFieldEventBaseProps & {
  queryRef: IssueFieldRemovedEvent$key & {createdAt?: string}
  rollupGroup?: Record<string, IssueFieldEventKey[]>
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
export const IssueFieldRemovedEventFragment = graphql`
  fragment IssueFieldRemovedEvent on IssueFieldRemovedEvent {
    databaseId
    actor {
      # eslint-disable-next-line relay/must-colocate-fragment-spreads
      ...TimelineRowEventActor
    }
    createdAt
    issueField {
      ... on IssueFieldText {
        dataType
        name
      }
      ... on IssueFieldDate {
        name
        dataType
      }
      ... on IssueFieldNumber {
        name
        dataType
      }
      ... on IssueFieldSingleSelect {
        name
        dataType
      }
    }
  }
`

export function IssueFieldRemovedEvent({queryRef, rollupGroup, ...props}: IssueFieldRemovedEventProps) {
  const {actor, createdAt, issueField, databaseId} = useFragment(IssueFieldRemovedEventFragment, queryRef)
  const rollupContent = rollupGroup ? (
    <RolledupIssueFieldEvent rollupGroup={rollupGroup} repositoryNameWithOwner={props.repositoryNameWithOwner} />
  ) : undefined

  return (
    <IssueFieldEvent
      actor={actor}
      createdAt={createdAt}
      fieldName={issueField?.name}
      dataType={issueField?.dataType}
      databaseId={databaseId}
      leadingLabel={rollupGroup ? undefined : LABELS.timeline.issueFieldRemoved.leading}
      hasValue={false}
      rollupContent={rollupContent}
      {...props}
    />
  )
}

/**
 * @generated SignedSource<<2f64183cdf016e7cd56af897ebb6daa0>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
export type IssueStateReason = "COMPLETED" | "DUPLICATE" | "NOT_PLANNED" | "REOPENED" | "%future added value";
export type PullRequestState = "CLOSED" | "MERGED" | "OPEN" | "%future added value";
import type { FragmentRefs } from "relay-runtime";
export type IssueLink$data = {
  readonly __typename: "Issue";
  readonly id: string;
  readonly issueTitleHTML: string;
  readonly number: number;
  readonly repository: {
    readonly id: string;
    readonly isPrivate: boolean;
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
  };
  readonly stateReason: IssueStateReason | null | undefined;
  readonly url: string;
  readonly " $fragmentType": "IssueLink";
} | {
  readonly __typename: "PullRequest";
  readonly id: string;
  readonly isDraft: boolean;
  readonly isInMergeQueue: boolean;
  readonly number: number;
  readonly pullTitleHTML: string;
  readonly repository: {
    readonly id: string;
    readonly isPrivate: boolean;
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
  };
  readonly state: PullRequestState;
  readonly url: string;
  readonly " $fragmentType": "IssueLink";
} | {
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  readonly __typename: "%other";
  readonly " $fragmentType": "IssueLink";
};
export type IssueLink$key = {
  readonly " $data"?: IssueLink$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueLink">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "url",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "concreteType": "Repository",
  "kind": "LinkedField",
  "name": "repository",
  "plural": false,
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isPrivate",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "owner",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "login",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueLink",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v0/*: any*/),
        {
          "alias": "issueTitleHTML",
          "args": null,
          "kind": "ScalarField",
          "name": "titleHTML",
          "storageKey": null
        },
        (v1/*: any*/),
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "stateReason",
          "storageKey": null
        },
        (v3/*: any*/)
      ],
      "type": "Issue",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v0/*: any*/),
        {
          "alias": "pullTitleHTML",
          "args": null,
          "kind": "ScalarField",
          "name": "titleHTML",
          "storageKey": null
        },
        (v1/*: any*/),
        (v2/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "state",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isDraft",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isInMergeQueue",
          "storageKey": null
        },
        (v3/*: any*/)
      ],
      "type": "PullRequest",
      "abstractKey": null
    }
  ],
  "type": "ReferencedSubject",
  "abstractKey": "__isReferencedSubject"
};
})();

(node as any).hash = "863d75bbc29beaf8626fd20f4653cc17";

export default node;

import {useGetHovercardAttributesForType} from '@github-ui/hovercards/use-get-hovercard-attributes-for-type'
import {useIssueState} from '@github-ui/issue-pr-state'
import type {IssueStateReasonType, IssueStateType} from '@github-ui/issue-pr-state/constants'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {VerifiedHTMLBox} from '@github-ui/safe-html/VerifiedHTML'
import {LockIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'
import {Tooltip} from '@primer/react/deprecated'
import {Octicon} from '@primer/styled-react/deprecated'
import {clsx} from 'clsx'
import {graphql, useFragment} from 'react-relay'

import {LABELS} from '../constants/labels'
import {formatIssueReference} from '../utils/format-issue-reference'
import type {IssueLink$key} from './__generated__/IssueLink.graphql'
import styles from './IssueLink.module.css'

type IssueLinkProps = {
  data: IssueLink$key
  targetOwnerLogin: string
  targetRepositoryId: string
  inline?: boolean
}

export function IssueLink({
  data,
  targetRepositoryId,
  targetOwnerLogin,
  inline = false,
}: IssueLinkProps): React.ReactElement {
  const source = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment IssueLink on ReferencedSubject {
        __typename
        ... on Issue {
          id
          issueTitleHTML: titleHTML
          url
          number
          stateReason
          repository {
            id
            name
            isPrivate
            owner {
              login
            }
          }
        }
        ... on PullRequest {
          id
          pullTitleHTML: titleHTML
          url
          number
          state
          isDraft
          isInMergeQueue
          repository {
            id
            name
            isPrivate
            owner {
              login
            }
          }
        }
      }
    `,
    data,
  )
  const getHovercardAttributesForType = useGetHovercardAttributesForType()
  const isIssue = source.__typename === 'Issue'
  const isPullRequest = source.__typename === 'PullRequest'

  const state = (isPullRequest ? source.state : undefined) as IssueStateType
  const stateReason = (isIssue ? source.stateReason : undefined) as IssueStateReasonType
  const {sourceIcon} = useIssueState({state, stateReason})
  const isDraft = isPullRequest ? source.isDraft : undefined
  const isInMergeQueue = isPullRequest ? source.isInMergeQueue : undefined
  const icon = sourceIcon(source.__typename as 'Issue' | 'PullRequest', isDraft, isInMergeQueue)

  if (!isIssue && !isPullRequest) {
    return <></>
  }
  const hovercardAttributes =
    source.repository && source.number
      ? isIssue
        ? getHovercardAttributesForType('issue', {
            owner: source.repository.owner.login,
            repo: source.repository.name,
            issueNumber: source.number,
          })
        : getHovercardAttributesForType('pull_request', {
            owner: source.repository.owner.login,
            repo: source.repository.name,
            pullRequestNumber: source.number,
          })
      : {}

  const issueReference = formatIssueReference(
    {
      number: source.number,
      ownerLogin: source.repository.owner.login,
      repoId: source.repository.id,
      repoName: source.repository.name,
    },
    targetRepositoryId,
    targetOwnerLogin,
  )

  const privateDescriptionId = `${source.id}-private-description`

  // Defining the title in this way avoids a problem that stems from the titleHTML field being defined as different
  // types in the Issue and PullRequest platform objects.
  const titleHTML = isIssue ? source.issueTitleHTML : source.pullTitleHTML

  const InlineLink = (
    <>
      <Octicon icon={icon} size={16} sx={{mr: inline ? '4px' : 'initial', mt: inline ? 'initial' : '2px'}} />
      <Link
        href={source.url}
        {...hovercardAttributes}
        aria-describedby={source.repository.isPrivate ? privateDescriptionId : undefined}
        inline
        className={styles.issueLinkAnchor}
      >
        <VerifiedHTMLBox
          as="bdi"
          className={clsx('markdown-title', styles.issueTitleContainer)}
          /* eslint-disable-next-line @github-ui/github-monorepo/no-cast-as-safe-html-string -- HTML is sanitized server-side. TODO: Move type assertion to GraphQL fragment IssueLink.issueTitleHTML / IssueLink.pullTitleHTML */
          html={titleHTML as SafeHTMLString}
        />
        <span className={styles.repoIssueNumber}> {issueReference}</span>
      </Link>
      {source.repository.isPrivate && source.repository.id !== targetRepositoryId && (
        <>
          <Tooltip
            aria-label={LABELS.crossReferencedEventLockTooltip(
              `${source.repository.owner.login}/${source.repository.name}`,
            )}
          >
            <Octicon icon={LockIcon} />
          </Tooltip>
          <span id={privateDescriptionId} className="sr-only">
            {LABELS.crossReferencedEvent.privateEventDescription}
          </span>
        </>
      )}
    </>
  )

  return inline ? <>{InlineLink}</> : <div className={styles.issueContainer}>{InlineLink}</div>
}

/**
 * @generated SignedSource<<db9a38413548c8358b08a4cb4dfc453f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
export type IssueTypeColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "YELLOW" | "%future added value";
import type { FragmentRefs } from "relay-runtime";
export type IssueTypeAddedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly issueType: {
    readonly color: IssueTypeColor;
    readonly name: string;
  } | null | undefined;
  readonly " $fragmentType": "IssueTypeAddedEvent";
};
export type IssueTypeAddedEvent$key = {
  readonly " $data"?: IssueTypeAddedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueTypeAddedEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueTypeAddedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "IssueType",
      "kind": "LinkedField",
      "name": "issueType",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "color",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "IssueTypeAddedEvent",
  "abstractKey": null
};

(node as any).hash = "c883158dedd491fa3112db2b1a21dc2c";

export default node;

import {IssueTypeToken} from '@github-ui/issue-type-token'
import {IssueOpenedIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {IssueTypeAddedEvent$key} from './__generated__/IssueTypeAddedEvent.graphql'
import styles from './IssueTypeEvent.module.css'
import {TimelineRow} from './row/TimelineRow'

type IssueTypeAddedEventProps = {
  queryRef: IssueTypeAddedEvent$key & {createdAt?: string}
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  repositoryNameWithOwner?: string
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
const IssueTypeAddedEventFragment = graphql`
  fragment IssueTypeAddedEvent on IssueTypeAddedEvent {
    databaseId
    actor {
      ...TimelineRowEventActor
    }
    createdAt
    issueType {
      name
      color
    }
  }
`

export function IssueTypeAddedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  repositoryNameWithOwner,
}: IssueTypeAddedEventProps) {
  const {actor, createdAt, issueType, databaseId} = useFragment(IssueTypeAddedEventFragment, queryRef)

  if (!issueType) {
    return null
  }

  const highlighted = String(databaseId) === highlightedEventId

  const getTooltipText = (isTextTruncated: boolean) => {
    return isTextTruncated ? issueType.name : undefined
  }

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={IssueOpenedIcon}
    >
      <TimelineRow.Main>
        {`${LABELS.timeline.issueTypeAdded.leading}`}
        <div className={styles.issueTypeTokenWrapper}>
          <IssueTypeToken
            name={issueType.name}
            color={issueType.color}
            href={`/${repositoryNameWithOwner}/issues?q=type:"${issueType.name}"`}
            getTooltipText={getTooltipText}
            size="small"
          />
        </div>
        {`${LABELS.timeline.issueTypeAdded.trailing} `}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

/**
 * @generated SignedSource<<5e28d4a9602780d98a9aa71d3538779b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
export type IssueTypeColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "YELLOW" | "%future added value";
import type { FragmentRefs } from "relay-runtime";
export type IssueTypeChangedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly issueType: {
    readonly color: IssueTypeColor;
    readonly name: string;
  } | null | undefined;
  readonly prevIssueType: {
    readonly color: IssueTypeColor;
    readonly name: string;
  } | null | undefined;
  readonly " $fragmentType": "IssueTypeChangedEvent";
};
export type IssueTypeChangedEvent$key = {
  readonly " $data"?: IssueTypeChangedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueTypeChangedEvent">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "color",
    "storageKey": null
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueTypeChangedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "IssueType",
      "kind": "LinkedField",
      "name": "issueType",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "IssueType",
      "kind": "LinkedField",
      "name": "prevIssueType",
      "plural": false,
      "selections": (v0/*: any*/),
      "storageKey": null
    }
  ],
  "type": "IssueTypeChangedEvent",
  "abstractKey": null
};
})();

(node as any).hash = "ff78cef208baee819e716cf0308f130a";

export default node;

import {IssueTypeToken} from '@github-ui/issue-type-token'
import {IssueOpenedIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {IssueTypeChangedEvent$key} from './__generated__/IssueTypeChangedEvent.graphql'
import styles from './IssueTypeEvent.module.css'
import {TimelineRow} from './row/TimelineRow'

type IssueTypeChangedEventProps = {
  queryRef: IssueTypeChangedEvent$key & {createdAt?: string}
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  repositoryNameWithOwner?: string
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
const IssueTypeChangedEventFragment = graphql`
  fragment IssueTypeChangedEvent on IssueTypeChangedEvent {
    databaseId
    actor {
      ...TimelineRowEventActor
    }
    createdAt
    issueType {
      name
      color
    }
    prevIssueType {
      name
      color
    }
  }
`

export function IssueTypeChangedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  repositoryNameWithOwner,
}: IssueTypeChangedEventProps) {
  const {actor, createdAt, issueType, prevIssueType, databaseId} = useFragment(IssueTypeChangedEventFragment, queryRef)

  if (!issueType) {
    return null
  }

  const highlighted = String(databaseId) === highlightedEventId

  const getTooltipText = (isTextTruncated: boolean) => {
    return isTextTruncated ? issueType.name : undefined
  }

  if (!prevIssueType) {
    return null
  }

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={IssueOpenedIcon}
    >
      <TimelineRow.Main>
        {`${LABELS.timeline.issueTypeChanged.leading}`}
        <div className={styles.issueTypeTokenWrapper}>
          <IssueTypeToken
            name={prevIssueType.name}
            color={prevIssueType.color}
            href={`/${repositoryNameWithOwner}/issues?q=type:"${prevIssueType.name}"`}
            getTooltipText={getTooltipText}
            size="small"
          />
        </div>
        {`${LABELS.timeline.issueTypeChanged.trailing}`}
        <div className={styles.issueTypeTokenWrapper}>
          <IssueTypeToken
            name={issueType.name}
            color={issueType.color}
            href={`/${repositoryNameWithOwner}/issues?q=type:"${issueType.name}"`}
            getTooltipText={getTooltipText}
            size="small"
          />
        </div>
      </TimelineRow.Main>
    </TimelineRow>
  )
}

/**
 * @generated SignedSource<<f670021b5b96f0d64f934997b262cf3b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
export type IssueTypeColor = "BLUE" | "GRAY" | "GREEN" | "ORANGE" | "PINK" | "PURPLE" | "RED" | "YELLOW" | "%future added value";
import type { FragmentRefs } from "relay-runtime";
export type IssueTypeRemovedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly issueType: {
    readonly color: IssueTypeColor;
    readonly name: string;
  } | null | undefined;
  readonly " $fragmentType": "IssueTypeRemovedEvent";
};
export type IssueTypeRemovedEvent$key = {
  readonly " $data"?: IssueTypeRemovedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"IssueTypeRemovedEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "IssueTypeRemovedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "IssueType",
      "kind": "LinkedField",
      "name": "issueType",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "color",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "IssueTypeRemovedEvent",
  "abstractKey": null
};

(node as any).hash = "9fd0747bbf54ad19f163ff39412ad164";

export default node;

import {IssueTypeToken} from '@github-ui/issue-type-token'
import {IssueOpenedIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {IssueTypeRemovedEvent$key} from './__generated__/IssueTypeRemovedEvent.graphql'
import styles from './IssueTypeEvent.module.css'
import {TimelineRow} from './row/TimelineRow'

type IssueTypeRemovedEventProps = {
  queryRef: IssueTypeRemovedEvent$key & {createdAt?: string}
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  repositoryNameWithOwner?: string
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
const IssueTypeRemovedEventFragment = graphql`
  fragment IssueTypeRemovedEvent on IssueTypeRemovedEvent {
    databaseId
    actor {
      ...TimelineRowEventActor
    }
    createdAt
    issueType {
      name
      color
    }
  }
`

export function IssueTypeRemovedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  repositoryNameWithOwner,
}: IssueTypeRemovedEventProps) {
  const {actor, createdAt, issueType, databaseId} = useFragment(IssueTypeRemovedEventFragment, queryRef)

  if (!issueType) {
    return null
  }

  const highlighted = String(databaseId) === highlightedEventId

  const getTooltipText = (isTextTruncated: boolean) => {
    return isTextTruncated ? issueType.name : undefined
  }

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={IssueOpenedIcon}
    >
      <TimelineRow.Main>
        {`${LABELS.timeline.issueTypeRemoved.leading}`}
        <div className={styles.issueTypeTokenWrapper}>
          <IssueTypeToken
            name={issueType.name}
            color={issueType.color}
            href={`/${repositoryNameWithOwner}/issues?q=type:"${issueType.name}"`}
            getTooltipText={getTooltipText}
            size="small"
          />
        </div>
        {`${LABELS.timeline.issueTypeRemoved.trailing} `}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

import {LabelToken} from '@github-ui/label-token'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {VerifiedHTMLText} from '@github-ui/safe-html/VerifiedHTML'
import {Link} from '@primer/react'
import {Tooltip} from '@primer/styled-react'
import {useMemo} from 'react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {VALUES} from '../constants/values'
import type {LabelData$key} from './__generated__/LabelData.graphql'
import labelStyles from './Label.module.css'
import styles from './labels.module.css'

type LabelProps = {
  queryRef: LabelData$key
  timelineEventBaseUrl: string
}

export function Label({queryRef, timelineEventBaseUrl}: LabelProps): React.ReactElement {
  const {nameHTML, name, color, id, description} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment LabelData on Label {
        nameHTML
        name
        color
        id
        description
      }
    `,
    queryRef,
  )

  const url = useMemo(() => {
    return `${timelineEventBaseUrl}?q=${encodeURIComponent(VALUES.labelQuery(name))}`
  }, [timelineEventBaseUrl, name])

  return (
    <Tooltip
      text={description ?? ''}
      sx={{
        visibility: description ? 'visible' : 'hidden',
      }}
      className={labelStyles.labelDescriptionTooltip}
    >
      <Link href={url} className={styles.labelLink} aria-describedby={`${id}-tooltip`} muted>
        <LabelToken
          /* eslint-disable-next-line @github-ui/github-monorepo/no-cast-as-safe-html-string -- HTML is sanitized server-side. TODO: Move type assertion to GraphQL fragment LabelData.nameHTML */
          text={<VerifiedHTMLText html={nameHTML as SafeHTMLString} />}
          fillColor={`#${color}`}
          key={id}
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '20ch',
            cursor: 'pointer',
          }}
        />
        <span className="sr-only" id={`${id}-tooltip`}>
          {description ?? ''}
        </span>
      </Link>
    </Tooltip>
  )
}

/**
 * @generated SignedSource<<8e4cf4f805b48b6b9f5da4f81c535bed>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type LabelData$data = {
  readonly color: string;
  readonly description: string | null | undefined;
  readonly id: string;
  readonly name: string;
  readonly nameHTML: string;
  readonly " $fragmentType": "LabelData";
};
export type LabelData$key = {
  readonly " $data"?: LabelData$data;
  readonly " $fragmentSpreads": FragmentRefs<"LabelData">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LabelData",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "nameHTML",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "color",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "description",
      "storageKey": null
    }
  ],
  "type": "Label",
  "abstractKey": null
};

(node as any).hash = "a842ed2c9f0767be6cd6e10b360be097";

export default node;

/**
 * @generated SignedSource<<4837e9b7ad7d6890635f17bb9fc6aa1a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type LabeledEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly label: {
    readonly " $fragmentSpreads": FragmentRefs<"LabelData">;
  };
  readonly " $fragmentType": "LabeledEvent";
};
export type LabeledEvent$key = {
  readonly " $data"?: LabeledEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"LabeledEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LabeledEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Label",
      "kind": "LinkedField",
      "name": "label",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "LabelData"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "LabeledEvent",
  "abstractKey": null
};

(node as any).hash = "b7e2ce506173e4d9028a5365bafcd8bd";

export default node;

import {TagIcon} from '@primer/octicons-react'
import type React from 'react'
import {Fragment} from 'react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {LabeledEvent$key} from './__generated__/LabeledEvent.graphql'
import type {UnlabeledEvent$key} from './__generated__/UnlabeledEvent.graphql'
import {Label} from './Label'
import styles from './labels.module.css'
import {RolledupLabeledEvent} from './RolledupLabeledEvent'
import {TimelineRow} from './row/TimelineRow'

type LabeledEventProps = {
  queryRef: LabeledEvent$key
  rollupGroup?: Record<string, Array<LabeledEvent$key | UnlabeledEvent$key>>
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  timelineEventBaseUrl: string
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
const LabeledEventFragment = graphql`
  fragment LabeledEvent on LabeledEvent {
    databaseId
    createdAt
    actor {
      ...TimelineRowEventActor
    }
    label {
      ...LabelData
    }
  }
`

export function LabeledEvent({
  queryRef,
  rollupGroup,
  issueUrl,
  onLinkClick,
  timelineEventBaseUrl,
  highlightedEventId,
  refAttribute,
}: LabeledEventProps): React.ReactElement {
  const {actor, createdAt, databaseId} = useFragment(LabeledEventFragment, queryRef)
  const highlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={TagIcon}
    >
      <TimelineRow.Main>
        {rollupGroup ? (
          <RolledupLabeledEvent rollupGroup={rollupGroup} timelineEventBaseUrl={timelineEventBaseUrl} />
        ) : (
          <AddedLabelsRendering queryRefs={[queryRef]} timelineEventBaseUrl={timelineEventBaseUrl} />
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

export const AddedLabelsRendering = ({
  queryRefs,
  timelineEventBaseUrl,
}: Pick<LabeledEventProps, 'timelineEventBaseUrl'> & {queryRefs: LabeledEvent$key[]}) => {
  if (queryRefs.length === 0) {
    return null
  }

  return (
    <>
      {`${LABELS.timeline.added} `}
      {queryRefs.map((queryRef, index) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key
        <Fragment key={index}>
          <InternalAddedLabelRendering queryRef={queryRef} timelineEventBaseUrl={timelineEventBaseUrl} />{' '}
        </Fragment>
      ))}
    </>
  )
}

const InternalAddedLabelRendering = ({
  queryRef,
  timelineEventBaseUrl,
}: Pick<LabeledEventProps, 'queryRef' | 'timelineEventBaseUrl'>) => {
  const {label} = useFragment(LabeledEventFragment, queryRef)
  return (
    <div className={styles.labelContainer}>
      <Label queryRef={label} timelineEventBaseUrl={timelineEventBaseUrl} />
    </div>
  )
}

export const LABELS = {
  repositoryOwner: 'Repository owner',
  metadataHeader: 'Metadata',
  metadataLabel: 'Details',
  timeline: {
    header: 'Activity',
    added: 'added',
    removed: 'removed',
    removedTheirAssignment: 'removed their assignment',
    unassigned: 'unassigned',
    locked: 'locked',
    limitedToCollaborators: 'and limited conversation to collaborators',
    unlockedConversation: 'unlocked this conversation',
    pinned: 'pinned this issue',
    unpinned: 'unpinned this issue',
    closedThis: 'closed this',
    subscribed: 'subscribed',
    unsubscribed: 'unsubscribed',
    mentioned: 'mentioned this',
    as: 'as',
    in: 'in',
    of: 'of',
    to: 'to',
    and: 'and',
    reopenedThis: 'reopened this',
    selfAssignedThis: 'self-assigned this',
    assigned: 'assigned',
    temporarily: 'temporarily',
    blocked: 'blocked',
    deletedACommentFrom: 'deleted a comment from',
    addedToMilestone: 'added this to the',
    removedFromMilestone: 'removed this from the',
    milestone: 'milestone',
    milestoneDeleted: 'This milestone has been deleted',
    renamedTitle: 'changed the title',
    mentionedThisIn: 'mentioned this',
    linkedAClosingPR: 'linked a pull request that will close this issue',
    addedCommitsThatReferences: (numCommits: number) =>
      `added ${numCommits === 1 ? 'a' : numCommits} commit${numCommits === 1 ? '' : 's'} that reference${
        numCommits === 1 ? 's' : ''
      } this issue`,
    transferredThis: 'transferred this issue from',
    issueFromNote: 'created this issue from a note in',
    removedLinkedPR: 'removed a link to a pull request',
    markedAsDuplicate: 'marked this as a duplicate of',
    unmarkedAsDuplicate: 'unmarked this as a duplicate of',
    convertedToDiscussion: 'converted this issue into a discussion',
    convertedFromDraftIssue: 'converted this from a draft issue',
    addedThisTo: 'added this to',
    removedThisFrom: 'removed this from',
    movedThisFrom: 'moved this from',
    movedThisTo: 'moved this to',
    loadMore: (numberOfTimelineItems: number) => `Load ${numberOfTimelineItems} more`,
    loadAll: 'Load all',
    loadNewer: 'Load newer activity',
    loadOlder: 'Load older activity',
    announcements: {
      loadRemaining: 'Loading remaining timeline items',
      loadOlder: 'Loading older timeline items',
      loadNewer: 'Loading newer timeline items',
    },
    modifiedMilestones: 'modified the milestones:',
    modifiedMilestone: 'modified the milestone:',
    subIssueAdded: {
      single: 'added a sub-issue',
      multiple: 'added sub-issues',
    },
    subIssueRemoved: {
      single: 'removed a sub-issue',
      multiple: 'removed sub-issues',
    },
    parentIssueAdded: {
      single: 'added a parent issue',
      multiple: 'added parent issues',
    },
    parentIssueRemoved: {
      single: 'removed a parent issue',
      multiple: 'removed parent issues',
    },
    blockedByAdded: {
      single: 'marked this as blocked by',
      multiple: (count: number) => `marked this as blocked by ${count} issues`,
    },
    blockedByRemoved: {
      single: 'unmarked this as blocked by',
      multiple: (count: number) => `unmarked this as blocked by ${count} issues`,
    },
    blockingAdded: {
      single: 'marked this as blocking',
      multiple: (count: number) => `marked this as blocking ${count} issues`,
    },
    blockingRemoved: {
      single: 'unmarked this as blocking',
      multiple: (count: number) => `unmarked this as blocking ${count} issues`,
    },
    issueTypeAdded: {
      leading: 'added the',
      trailing: 'issue type',
    },
    issueTypeRemoved: {
      leading: 'removed the',
      trailing: 'issue type',
    },
    issueTypeChanged: {
      leading: 'changed the issue type from',
      trailing: 'to',
    },
    issueFieldAdded: {
      leading: 'set',
      trailing: 'to',
    },
    issueFieldChanged: {
      leading: 'changed',
      trailing: 'to',
    },
    issueFieldRemoved: {
      leading: 'cleared',
    },
    issueFieldRollup: {
      updated: 'updated',
      removed: 'removed',
      andAlso: 'and also',
    },
  },
  crossReferencedEventLockTooltip: (repoNameWithOwner: string) =>
    `Only people who can see ${repoNameWithOwner} will see this reference.`,
  crossReferencedEvent: {
    sectionLabel: 'Issues mentioned',
    privateEventDescription: 'This event is from a private repository and is only visible to repository members',
  },
  commitWillCloseMessage: (subjectType: string, abbreviatedOid: string, defaultBranch: string) =>
    `This ${
      subjectType === 'Issue' ? 'issue' : 'pull request'
    } will close once commit ${abbreviatedOid} is merged into the '${defaultBranch}' branch.`,
  undoMarkIssueAsDuplicate: (cannonicalIssueNumber: number) =>
    `Undo marking issue as duplicate of issue #${cannonicalIssueNumber}`,
}

import styles from './LayoutHelpers.module.css'

export function wrapElement(
  wrappedElement: React.ReactNode,
  // In case of Timelinetem, this represent the avatar for an IssueComment event
  leadingElement?: React.ReactNode,
  key?: string,
) {
  return (
    <div
      className={`${styles.timelineElement} ${leadingElement ? '' : styles.nonLeadingElement}`}
      key={key}
      data-wrapper-timeline-id={key}
    >
      {leadingElement}
      {wrappedElement}
    </div>
  )
}

import type {ListItem} from '@github-ui/markdown-editor/list-editing'
import {UnsafeHTMLBox} from '@github-ui/safe-html/UnsafeHTML'
import type {TaskItem} from '../constants/types'

import styles from './ListItem.module.css'

export type ListItemProps = {
  item: TaskItem
  position: number
}

export function ListItem({item, position}: ListItemProps) {
  const tasklistIstemTestIdBase = `tasklist-item-${position}-${item.markdownIndex}`

  return (
    <UnsafeHTMLBox
      html={item.content}
      as={'div'}
      data-testid={tasklistIstemTestIdBase}
      className={styles.ListItemContent}
    />
  )
}

import {createStore} from './create-store'

export const localStorageStore = createStore('localStorage')

/**
 * @generated SignedSource<<9848ca15c1c16ca331af4071d4b9e716>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
export type LockReason = "OFF_TOPIC" | "RESOLVED" | "SPAM" | "TOO_HEATED" | "%future added value";
import type { FragmentRefs } from "relay-runtime";
export type LockedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly lockReason: LockReason | null | undefined;
  readonly " $fragmentType": "LockedEvent";
};
export type LockedEvent$key = {
  readonly " $data"?: LockedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"LockedEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LockedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lockReason",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "LockedEvent",
  "abstractKey": null
};

(node as any).hash = "5cd622162b89b270c4ae9e3b77be0625";

export default node;

import {LockIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {getLockString} from '../utils/get-lock-string'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {LockedEvent$key} from './__generated__/LockedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'

type LockedEventProps = {
  queryRef: LockedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function LockedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: LockedEventProps): React.ReactElement {
  const {actor, createdAt, lockReason, databaseId} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment LockedEvent on LockedEvent {
        databaseId
        createdAt
        lockReason
        actor {
          ...TimelineRowEventActor
        }
      }
    `,
    queryRef,
  )
  const lockReasonString = getLockString(lockReason)
  const highlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      onLinkClick={onLinkClick}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      leadingIcon={LockIcon}
    >
      <TimelineRow.Main>
        {`${LABELS.timeline.locked} `}
        {lockReason && <>{`${LABELS.timeline.as} ${lockReasonString} `}</>}
        {`${LABELS.timeline.limitedToCollaborators} `}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

/**
 * @generated SignedSource<<7b7de0e12e277a01c554feea99a8950f>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type MarkedAsDuplicateEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly canonical: {
    readonly id?: string;
    readonly number?: number;
    readonly " $fragmentSpreads": FragmentRefs<"IssueLink">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly duplicate: {
    readonly id?: string;
    readonly number?: number;
    readonly " $fragmentSpreads": FragmentRefs<"IssueLink">;
  } | null | undefined;
  readonly id: string;
  readonly isCanonicalOfClosedDuplicate: boolean | null | undefined;
  readonly pendingUndo: boolean | null | undefined;
  readonly viewerCanUndo: boolean;
  readonly " $fragmentType": "MarkedAsDuplicateEvent";
};
export type MarkedAsDuplicateEvent$key = {
  readonly " $data"?: MarkedAsDuplicateEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"MarkedAsDuplicateEvent">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "IssueLink"
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "number",
  "storageKey": null
},
v3 = [
  (v0/*: any*/),
  (v1/*: any*/),
  (v2/*: any*/)
],
v4 = {
  "kind": "InlineFragment",
  "selections": (v3/*: any*/),
  "type": "Issue",
  "abstractKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "MarkedAsDuplicateEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "duplicate",
      "plural": false,
      "selections": [
        (v4/*: any*/),
        {
          "kind": "InlineFragment",
          "selections": (v3/*: any*/),
          "type": "PullRequest",
          "abstractKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "canonical",
      "plural": false,
      "selections": [
        (v4/*: any*/),
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/),
            (v2/*: any*/),
            (v1/*: any*/)
          ],
          "type": "PullRequest",
          "abstractKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "isCanonicalOfClosedDuplicate",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCanUndo",
      "storageKey": null
    },
    (v1/*: any*/),
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "pendingUndo",
          "storageKey": null
        }
      ]
    }
  ],
  "type": "MarkedAsDuplicateEvent",
  "abstractKey": null
};
})();

(node as any).hash = "b8c2d9721ff5f693c6e3aaad303c2c21";

export default node;

import {DuplicateIcon} from '@primer/octicons-react'
import {Button} from '@primer/react'
import {useCallback} from 'react'
import {graphql, useRelayEnvironment} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {commitUnmarkIssueAsDuplicateMutation} from '../mutations/unmark-issue-as-duplicate-mutation'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {MarkedAsDuplicateEvent$key} from './__generated__/MarkedAsDuplicateEvent.graphql'
import {IssueLink} from './IssueLink'
import {TimelineRow} from './row/TimelineRow'

type MarkedAsDuplicateEventProps = {
  queryRef: MarkedAsDuplicateEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  currentIssueId: string
  repositoryId: string
  ownerLogin: string
}

export function MarkedAsDuplicateEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  currentIssueId,
  repositoryId,
  ownerLogin,
}: MarkedAsDuplicateEventProps): React.ReactElement {
  const environment = useRelayEnvironment()

  const {
    actor,
    createdAt,
    canonical,
    duplicate,
    isCanonicalOfClosedDuplicate: isCanonicalDuplicate,
    databaseId,
    viewerCanUndo,
    pendingUndo,
    id,
  } = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment MarkedAsDuplicateEvent on MarkedAsDuplicateEvent {
        actor {
          ...TimelineRowEventActor
        }
        createdAt
        duplicate {
          ... on Issue {
            ...IssueLink @dangerously_unaliased_fixme
            id
            number
          }
          ... on PullRequest {
            ...IssueLink @dangerously_unaliased_fixme
            id
            number
          }
        }
        canonical {
          ... on Issue {
            ...IssueLink @dangerously_unaliased_fixme
            id
            number
          }
          ... on PullRequest {
            ...IssueLink @dangerously_unaliased_fixme
            number
            id
          }
        }
        isCanonicalOfClosedDuplicate
        databaseId
        viewerCanUndo
        pendingUndo
        id
      }
    `,
    queryRef,
  )

  const canonicalId = canonical?.id

  const unMarkAsDuplicate = useCallback(() => {
    if (!canonicalId) return

    const input = {duplicateId: currentIssueId, cannonicalId: canonicalId}
    commitUnmarkIssueAsDuplicateMutation({environment, input, eventId: id})
  }, [canonicalId, environment, currentIssueId, id])

  const highlighted = String(databaseId) === highlightedEventId

  if (!duplicate) return <></>

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={DuplicateIcon}
      fillRow={viewerCanUndo}
    >
      <TimelineRow.Main>
        {isCanonicalDuplicate ? (
          <>
            marked <IssueLink inline data={duplicate} targetRepositoryId={repositoryId} targetOwnerLogin={ownerLogin} />{' '}
            as a duplicate of this issue{' '}
          </>
        ) : (
          <>
            {LABELS.timeline.markedAsDuplicate}
            <>
              &nbsp;
              <IssueLink inline data={duplicate} targetRepositoryId={repositoryId} targetOwnerLogin={ownerLogin} />{' '}
            </>
          </>
        )}
      </TimelineRow.Main>
      {viewerCanUndo && !pendingUndo && duplicate?.number && !isCanonicalDuplicate ? (
        <TimelineRow.Trailing>
          <Button onClick={unMarkAsDuplicate} aria-label={LABELS.undoMarkIssueAsDuplicate(duplicate.number)}>
            Undo
          </Button>
        </TimelineRow.Trailing>
      ) : null}
    </TimelineRow>
  )
}

import {LinkExternalIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {MentionedEvent$key} from './__generated__/MentionedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'

type MentionedEventProps = {
  queryRef: MentionedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function MentionedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: MentionedEventProps): React.ReactElement {
  const {actor, createdAt, databaseId} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment MentionedEvent on MentionedEvent {
        createdAt
        databaseId
        actor {
          ...TimelineRowEventActor
        }
      }
    `,
    queryRef,
  )

  const highlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={LinkExternalIcon}
    >
      <TimelineRow.Main>{`${LABELS.timeline.mentioned} `}</TimelineRow.Main>
    </TimelineRow>
  )
}

import type {NormalizedSequenceString} from '@github-ui/hotkey'
import {sendEvent} from '@github-ui/hydro-analytics'

import type {CommandEvent} from './command-event'
import {type CommandId, getKeybinding} from './commands'

/** https://hydro.githubapp.com/hydro_analytics/apps/ui-commands */
const HYDRO_APP_ID = 'ui-commands'

type CommandTriggerEvent = {
  /** The Hydro app ID. */
  app_name: string
  /** Full command ID in `service:command` form. */
  command_id: CommandId
  /**
   * How the event was triggered. More event methods may be added in the future:
   *  - `"keybinding"`: Via a keydown event according to the configured keybinding for the command.
   */
  trigger_type: 'keybinding' | 'click'
  /**
   * HTML of the opening tag of the target element for the event that triggered this command. When `trigger_type` is
   * `"keybinding"` this is the currently focused element if there is one; otherwise it will be the `<body>`.
   */
  target_element_html?: string
  /** The keybinding (in hotkey string format) configured for this command, if there is one. */
  keybinding?: NormalizedSequenceString
  /** If the handler threw an exception synchronously, this is a string representation of that exception. */
  handler_exception?: string
}
const CommandTriggerEvent = {
  TYPE: 'command.trigger',
  send(context: CommandTriggerEvent) {
    sendEvent(CommandTriggerEvent.TYPE, context)
  },
}

/** Get the opening HTML tag of the given element. */
function getOpeningHtmlTag(element: HTMLElement) {
  const tagName = element.tagName.toLowerCase()
  const attributes = Array.from(element.attributes)
    .map(attr => `${attr.name}="${attr.value.replaceAll('"', '\\"')}"`)
    .join(' ')
  return `<${tagName}${attributes ? ` ${attributes}` : ''}>`
}

/** Record a Hydro analytics event for triggering a command. */
export function recordCommandTriggerEvent(commandEvent: CommandEvent, domEvent: KeyboardEvent | MouseEvent) {
  CommandTriggerEvent.send({
    app_name: HYDRO_APP_ID,
    command_id: commandEvent.commandId,
    trigger_type: domEvent instanceof KeyboardEvent ? 'keybinding' : 'click',
    target_element_html: domEvent.target instanceof HTMLElement ? getOpeningHtmlTag(domEvent.target) : undefined,
    keybinding: getKeybinding(commandEvent.commandId),
  })
}

/**
 * @generated SignedSource<<20e4489cff2196c5921b269f46657d86>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type MilestonedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly milestone: {
    readonly url: string;
  } | null | undefined;
  readonly milestoneTitle: string;
  readonly " $fragmentType": "MilestonedEvent";
};
export type MilestonedEvent$key = {
  readonly " $data"?: MilestonedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"MilestonedEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "MilestonedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "milestoneTitle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Milestone",
      "kind": "LinkedField",
      "name": "milestone",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "url",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "MilestonedEvent",
  "abstractKey": null
};

(node as any).hash = "81a3a898b155f065ca3d228b91ed14a3";

export default node;

import {MilestoneIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {DemilestonedEvent$key} from './__generated__/DemilestonedEvent.graphql'
import type {MilestonedEvent$key} from './__generated__/MilestonedEvent.graphql'
import {getWrappedMilestoneLink} from './DemilestonedEvent'
import {RolledupMilestonedEvent} from './RolledupMilestonedEvent'
import {TimelineRow} from './row/TimelineRow'

type MilestonedEventProps = {
  queryRef: MilestonedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  rollupGroup?: Record<string, Array<MilestonedEvent$key | DemilestonedEvent$key>>
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
export const MilestonedEventFragment = graphql`
  fragment MilestonedEvent on MilestonedEvent {
    databaseId
    createdAt
    actor {
      ...TimelineRowEventActor
    }
    milestoneTitle
    milestone {
      url
    }
  }
`

export function MilestonedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  rollupGroup,
}: MilestonedEventProps): React.ReactElement {
  const {actor, createdAt, milestoneTitle, milestone, databaseId} = useFragment(MilestonedEventFragment, queryRef)
  const highlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={MilestoneIcon}
    >
      <TimelineRow.Main>
        {rollupGroup ? (
          <RolledupMilestonedEvent rollupGroup={rollupGroup} />
        ) : (
          <>
            {LABELS.timeline.addedToMilestone} {getWrappedMilestoneLink(milestone?.url, milestoneTitle)}
            {LABELS.timeline.milestone}{' '}
          </>
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

import {IssueTrackedByIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {getGroupCreatedAt} from '../utils/get-group-created-at'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {ParentIssueAddedEvent$key} from './__generated__/ParentIssueAddedEvent.graphql'
import {IssueLink} from './IssueLink'
import styles from './ParentIssueAddedEvent.module.css'
import {Ago} from './row/Ago'
import {TimelineRow} from './row/TimelineRow'

type RollupGroup = ParentIssueAddedEvent$key & {source?: {__typename: string}; createdAt?: string}
type RollupGroups = Record<string, RollupGroup[]>

type ParentIssueAddedEventProps = {
  queryRef: ParentIssueAddedEvent$key & {createdAt?: string}
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  rollupGroup?: RollupGroups
  repositoryId: string
  ownerLogin: string
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
const ParentIssueAddedEventFragment = graphql`
  fragment ParentIssueAddedEvent on ParentIssueAddedEvent {
    databaseId
    actor {
      ...TimelineRowEventActor
    }
    createdAt
    parent {
      ...IssueLink
      databaseId
    }
  }
`

export function ParentIssueAddedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  rollupGroup,
  repositoryId,
  ownerLogin,
}: ParentIssueAddedEventProps) {
  const {actor, createdAt, parent, databaseId} = useFragment(ParentIssueAddedEventFragment, queryRef)

  if (!parent) {
    return null
  }

  const highlighted = String(parent.databaseId) === highlightedEventId
  const rolledUpGroup = rollupGroup && rollupGroup['ParentIssueAddedEvent'] ? rollupGroup['ParentIssueAddedEvent'] : []
  const itemsToRender = rolledUpGroup.length === 0 ? [queryRef] : rolledUpGroup
  const eventCreatedAt = getGroupCreatedAt(queryRef.createdAt, rolledUpGroup)

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      showAgoTimestamp={false}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={IssueTrackedByIcon}
    >
      <TimelineRow.Main>
        {`${LABELS.timeline.parentIssueAdded[itemsToRender.length === 1 ? 'single' : 'multiple']} `}
        {eventCreatedAt ? (
          <Ago timestamp={new Date(eventCreatedAt)} linkUrl={createIssueEventExternalUrl(issueUrl, databaseId)} />
        ) : null}
      </TimelineRow.Main>
      <TimelineRow.Secondary>
        <ul className={styles.parentIssuesList}>
          {itemsToRender.map((item, index) => (
            <SubIssueEventItem
              // eslint-disable-next-line @eslint-react/no-array-index-key
              key={`${parent.databaseId}_${index}`}
              event={item}
              targetRepositoryId={repositoryId}
              targetOwnerLogin={ownerLogin}
            />
          ))}
        </ul>
      </TimelineRow.Secondary>
    </TimelineRow>
  )
}

function SubIssueEventItem({
  event,
  targetRepositoryId,
  targetOwnerLogin,
}: {
  event: ParentIssueAddedEvent$key
  targetRepositoryId: string
  targetOwnerLogin: string
}) {
  const {parent} = useFragment(ParentIssueAddedEventFragment, event)

  if (!parent) {
    return null
  }

  return (
    <li className={styles.parentIssueItem}>
      <IssueLink data={parent} targetRepositoryId={targetRepositoryId} targetOwnerLogin={targetOwnerLogin} />
    </li>
  )
}

/**
 * @generated SignedSource<<60a9ae6aae22e53e579600d34e3e1ab4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type ParentIssueRemovedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly parent: {
    readonly databaseId: number | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"IssueLink">;
  } | null | undefined;
  readonly " $fragmentType": "ParentIssueRemovedEvent";
};
export type ParentIssueRemovedEvent$key = {
  readonly " $data"?: ParentIssueRemovedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"ParentIssueRemovedEvent">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "databaseId",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ParentIssueRemovedEvent",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Issue",
      "kind": "LinkedField",
      "name": "parent",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "IssueLink"
        },
        (v0/*: any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "ParentIssueRemovedEvent",
  "abstractKey": null
};
})();

(node as any).hash = "dbb05f97bf8c1aea71d8af4625e9418c";

export default node;

import {IssueTrackedByIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {getGroupCreatedAt} from '../utils/get-group-created-at'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {ParentIssueRemovedEvent$key} from './__generated__/ParentIssueRemovedEvent.graphql'
import {IssueLink} from './IssueLink'
import styles from './ParentIssueRemovedEvent.module.css'
import {Ago} from './row/Ago'
import {TimelineRow} from './row/TimelineRow'

type RollupGroup = ParentIssueRemovedEvent$key & {source?: {__typename: string}; createdAt?: string}
type RollupGroups = Record<string, RollupGroup[]>

type ParentIssueRemovedEventProps = {
  queryRef: ParentIssueRemovedEvent$key & {createdAt?: string}
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  rollupGroup?: RollupGroups
  repositoryId: string
  ownerLogin: string
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
const ParentIssueRemovedEventFragment = graphql`
  fragment ParentIssueRemovedEvent on ParentIssueRemovedEvent {
    databaseId
    actor {
      ...TimelineRowEventActor
    }
    createdAt
    parent {
      ...IssueLink
      databaseId
    }
  }
`

export function ParentIssueRemovedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  rollupGroup,
  repositoryId,
  ownerLogin,
}: ParentIssueRemovedEventProps) {
  const {actor, createdAt, parent, databaseId} = useFragment(ParentIssueRemovedEventFragment, queryRef)

  if (!parent) {
    return null
  }

  const highlighted = String(parent.databaseId) === highlightedEventId
  const rolledUpGroup =
    rollupGroup && rollupGroup['ParentIssueRemovedEvent'] ? rollupGroup['ParentIssueRemovedEvent'] : []
  const itemsToRender = rolledUpGroup.length === 0 ? [queryRef] : rolledUpGroup
  const eventCreatedAt = getGroupCreatedAt(queryRef.createdAt, rolledUpGroup)

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      showAgoTimestamp={false}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={IssueTrackedByIcon}
    >
      <TimelineRow.Main>
        {`${LABELS.timeline.parentIssueRemoved[itemsToRender.length === 1 ? 'single' : 'multiple']} `}
        {eventCreatedAt ? (
          <Ago timestamp={new Date(eventCreatedAt)} linkUrl={createIssueEventExternalUrl(issueUrl, databaseId)} />
        ) : null}
      </TimelineRow.Main>
      <TimelineRow.Secondary>
        <ul className={styles.removedParentIssuesList}>
          {itemsToRender.map((item, index) => (
            <SubIssueEventItem
              // eslint-disable-next-line @eslint-react/no-array-index-key
              key={`${parent.databaseId}_${index}`}
              event={item}
              targetRepositoryId={repositoryId}
              targetOwnerLogin={ownerLogin}
            />
          ))}
        </ul>
      </TimelineRow.Secondary>
    </TimelineRow>
  )
}

function SubIssueEventItem({
  event,
  targetRepositoryId,
  targetOwnerLogin,
}: {
  event: ParentIssueRemovedEvent$key
  targetRepositoryId: string
  targetOwnerLogin: string
}) {
  const {parent} = useFragment(ParentIssueRemovedEventFragment, event)

  if (!parent) {
    return null
  }

  return (
    <li className={styles.removedParentIssueItem}>
      <IssueLink data={parent} targetRepositoryId={targetRepositoryId} targetOwnerLogin={targetOwnerLogin} />
    </li>
  )
}

import {PinIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {PinnedEvent$key} from './__generated__/PinnedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'

type PinnedEventProps = {
  queryRef: PinnedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function PinnedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: PinnedEventProps): React.ReactElement {
  const {actor, createdAt, databaseId} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment PinnedEvent on PinnedEvent {
        databaseId
        createdAt
        actor {
          ...TimelineRowEventActor
        }
      }
    `,
    queryRef,
  )
  const highlighted = String(databaseId) === highlightedEventId
  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={PinIcon}
    >
      <TimelineRow.Main>{`${LABELS.timeline.pinned} `}</TimelineRow.Main>
    </TimelineRow>
  )
}

import {session} from '@github/turbo'

interface ProgressBar {
  setValue(n: number): void
  hide(): void
  show(): void
}

export interface BrowserAdapter {
  progressBar: ProgressBar
}

const adapter = session.adapter as typeof session.adapter & BrowserAdapter

let progressBarDelay: ReturnType<typeof setTimeout> | null = null

/**
 * This delay of 99ms is just under our 100ms INP goal
 * https://thehub.github.com/epd/engineering/fundamentals/performance-web-performance/#what-to-look-for
 */
const delay = 99

/**
 * Start the ProgressBar at the top of the page after a 99ms delay.
 * This delay is long enough that very quick interactions will not show the progress bar, making them feel snappier,
 * but it will show for interactions that take longer than 100ms, rescuing INP responsiveness.
 */
export const beginProgressBar = () => {
  progressBarDelay = setTimeout(() => {
    adapter.progressBar.setValue(0)
    adapter.progressBar.show()
  }, delay)
}

/**
 * Complete the ProgressBar at the top of the page.
 */
export const completeProgressBar = () => {
  if (progressBarDelay !== null) {
    clearTimeout(progressBarDelay)
    progressBarDelay = null
  }
  adapter.progressBar.setValue(1)
  adapter.progressBar.hide()
}

import {TableIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'
import {Octicon} from '@primer/react/deprecated'

import styles from './ProjectV2.module.css'

type ProjectV2Props = {
  url: string
  title: string
}

export function ProjectV2({url, title}: ProjectV2Props): React.ReactElement {
  return (
    <>
      <Octicon icon={TableIcon} />{' '}
      <Link href={url} inline className={styles.projectLink}>
        {title}
      </Link>
    </>
  )
}

/**
 * @generated SignedSource<<6287f9755f0f2ba7d07964acd00bcb66>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type ProjectV2ItemStatusChangedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly previousStatus: string;
  readonly project: {
    readonly title: string;
    readonly url: string;
  } | null | undefined;
  readonly status: string;
  readonly " $fragmentType": "ProjectV2ItemStatusChangedEvent";
};
export type ProjectV2ItemStatusChangedEvent$key = {
  readonly " $data"?: ProjectV2ItemStatusChangedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"ProjectV2ItemStatusChangedEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ProjectV2ItemStatusChangedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2",
      "kind": "LinkedField",
      "name": "project",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "title",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "url",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "previousStatus",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    }
  ],
  "type": "ProjectV2ItemStatusChangedEvent",
  "abstractKey": null
};

(node as any).hash = "74055539c00657f2a6fdc0662376e744";

export default node;

import {TableIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import type {ProjectV2ItemStatusChangedEvent$key} from './__generated__/ProjectV2ItemStatusChangedEvent.graphql'
import {ProjectV2} from './ProjectV2'
import styles from './ProjectV2ItemStatusChangedEvent.module.css'
import {TimelineRow} from './row/TimelineRow'

type ProjectV2ItemStatusChangedEventProps = {
  queryRef: ProjectV2ItemStatusChangedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
}

export function ProjectV2ItemStatusChangedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
}: ProjectV2ItemStatusChangedEventProps): React.ReactElement {
  const {actor, createdAt, project, previousStatus, status} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment ProjectV2ItemStatusChangedEvent on ProjectV2ItemStatusChangedEvent {
        createdAt
        actor {
          ...TimelineRowEventActor
        }
        project {
          title
          url
        }
        previousStatus
        status
      }
    `,
    queryRef,
  )

  if (!project) {
    return <></>
  }

  const safeStatus = status.length > 0 ? status : 'No status'

  // Once we have support for the project IDs being exposed in GQL we can shift to using the
  // `issueEventExternalUrl` function here for our deep linked timestamp.
  return (
    <TimelineRow
      highlighted={false}
      actor={actor}
      onLinkClick={onLinkClick}
      createdAt={createdAt}
      deepLinkUrl={issueUrl}
      leadingIcon={TableIcon}
    >
      <TimelineRow.Main>
        {previousStatus && previousStatus.length > 0 ? (
          <>{`${LABELS.timeline.movedThisFrom} ${previousStatus} ${LABELS.timeline.to} `}</>
        ) : (
          <>{`${LABELS.timeline.movedThisTo} `}</>
        )}
        {`${safeStatus} ${LABELS.timeline.in} `}
        <span className={styles.projectWrapper}>
          <ProjectV2 title={project?.title} url={project?.url} />
        </span>
      </TimelineRow.Main>
    </TimelineRow>
  )
}

import {isFeatureEnabled} from '@github-ui/feature-flags'
import {updateCurrentState} from '@github-ui/history'
import {LRUMap} from '@github-ui/lru-map'
import {matchRoutes} from '@github-ui/react-router'
import {failSoftNav, startSoftNav} from '@github-ui/soft-nav/state'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {reloadPage} from './reload-page'

interface ReactApp extends HTMLElement {
  navigate?: (pathname: string) => Promise<void>
  routes?: never[]
  uuid: string
}

export const bfCache = new LRUMap<string, Map<string, Element>>({size: 20})

function replaceTurboElements({idsToRemove, reactApp}: {idsToRemove: string[]; reactApp: ReactApp}) {
  const removedElements = new Map()

  if (idsToRemove.length === 0) {
    reactApp.hidden = false
    return removedElements
  }

  // Batch DOM changes to prevent flash
  requestAnimationFrame(() => {
    reactApp.hidden = false

    for (const elementId of idsToRemove) {
      const element = document.getElementById(elementId)

      if (element) {
        // Replace elements with hidden placeholders so we know where to restore them later
        const placeholder = document.createElement('div')
        placeholder.id = elementId
        placeholder.hidden = true
        element.replaceWith(placeholder)

        removedElements.set(elementId, element)
      }
    }
  })

  return removedElements
}

export function reactNavigateIfPossible(event: TurboClickEvent | TurboFrameClickEvent) {
  if (!(event.target instanceof HTMLElement)) return

  const target = event.target

  const reactAppName = target.getAttribute('data-react-nav')

  if (!reactAppName) return false

  // Try to use React navigation if the react app is loaded
  const reactApp = Array.from(document.querySelectorAll<ReactApp>('react-app')).find(
    app => app.getAttribute('app-name') === reactAppName,
  )

  if (!reactApp) return false

  const anchorId = target.getAttribute('data-react-nav-anchor')

  const firedReactNav = anchorId
    ? clickOnReactAnchor({event, reactApp, anchorId})
    : imperativelyNavigateToReactRoute({event, reactApp})

  if (!firedReactNav) return false

  const idsToRemove = target.getAttribute('data-react-nav-remove')?.split(',') || []

  if (idsToRemove.length === 0) return firedReactNav

  const currentHref = window.location.href
  updateCurrentState({restoreTurboElements: {appName: reactAppName, idsToRestore: idsToRemove}})

  const handleSoftNavEnd = () => {
    updateCurrentState({restoreReactElements: {appName: reactAppName, idsToRemove}})
    const removedElements = replaceTurboElements({idsToRemove, reactApp})

    if (removedElements) bfCache.set(currentHref, removedElements)

    document.removeEventListener(SOFT_NAV_STATE.ERROR, handleSoftNavError)
  }

  const handleSoftNavError = () => {
    document.removeEventListener(SOFT_NAV_STATE.END, handleSoftNavEnd)
  }

  document.addEventListener(SOFT_NAV_STATE.END, handleSoftNavEnd, {once: true})
  document.addEventListener(SOFT_NAV_STATE.ERROR, handleSoftNavError, {once: true})

  return firedReactNav
}

function clickOnReactAnchor({
  event,
  anchorId,
}: {
  event: TurboClickEvent | TurboFrameClickEvent
  reactApp: ReactApp
  anchorId: string
}) {
  const anchor = document.getElementById(anchorId) as HTMLAnchorElement | null

  if (!anchor) return false

  anchor.click()
  preventTurboNavigation({event})
  return true
}

function imperativelyNavigateToReactRoute({
  event,
  reactApp,
}: {
  event: TurboClickEvent | TurboFrameClickEvent
  reactApp: ReactApp
}) {
  const url = new URL(event.detail.url, window.location.origin)
  const pathname = url.pathname + url.search + url.hash

  const routes = reactApp.routes
  if (!routes || !Array.isArray(routes) || routes.length === 0) return false

  const earlySoftNavEnabled = isFeatureEnabled('react_nav_early_soft_nav')
  // Data-router apps already call startSoftNav via the Proxy wrapper.
  const isDataRouter = reactApp.getAttribute('data-data-router-enabled') === 'true'

  try {
    // Check if the URL matches any routes in the react app
    const matchedRoutes = matchRoutes(routes, url.pathname)

    if (!matchedRoutes || matchedRoutes.length === 0) {
      // Route is not part of the react app, fall back to Turbo navigation
      return false
    }

    if (!reactApp.navigate) return false

    // Fire soft-nav:start early so the INP observer resets before heavy rendering.
    if (earlySoftNavEnabled && !isDataRouter) {
      startSoftNav('react')
    }

    // NOTE: This code interacts with the router/history directly, which is not officially supported
    // by React Router and could break if the underlying libraries change. As we migrate more toward
    // full React pages, usage of this pattern should decrease. If it does break in the future, we'll
    // fallback to a turbo navigation to avoid impacting user experience.
    reactApp.navigate(pathname)
    preventTurboNavigation({event})
    return true
  } catch {
    if (earlySoftNavEnabled && !isDataRouter) {
      failSoftNav()
    }
    return false
  }
}

function preventTurboNavigation({event}: {event: TurboClickEvent | TurboFrameClickEvent}) {
  event.preventDefault() // prevent Turbo navigation
  event.detail.originalEvent?.preventDefault() // prevent the original link click
}

function restoreTurboElements({appName, idsToRestore}: {appName: string; idsToRestore?: string[]}) {
  const reactApp = document.querySelector<HTMLElement>(`react-app[app-name="${appName}"]`)

  const cache = bfCache.get(window.location.href)
  if (!cache && idsToRestore && idsToRestore.length > 0) {
    return reloadPage()
  }

  if (reactApp) reactApp.hidden = true

  if (!cache) return

  requestAnimationFrame(() => {
    // restore Rails cached elements
    for (const [elementId, element] of cache.entries()) {
      const placeholder = document.getElementById(elementId)
      if (placeholder) placeholder.replaceWith(element)
    }
  })
}

ssrSafeWindow?.addEventListener('popstate', ({state}) => {
  if (!state) return

  if (state.restoreTurboElements) {
    return restoreTurboElements(state.restoreTurboElements)
  }

  // Wait for React to render before replacing elements to avoid a blank flash
  if (state.restoreReactElements) {
    document.addEventListener(
      SOFT_NAV_STATE.REACT_DONE,
      () => {
        const reactApp = document.querySelector<ReactApp>(`react-app[app-name="${state.restoreReactElements.appName}"]`)
        if (reactApp) {
          replaceTurboElements({
            idsToRemove: state.restoreReactElements.idsToRemove,
            reactApp,
          })
        }
      },
      {once: true},
    )
  }
})

import {GitCommitIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {ReferencedEvent$key} from './__generated__/ReferencedEvent.graphql'
import styles from './ReferencedEvent.module.css'
import {ReferencedEventInner, type ReferencedEventInnerProps} from './ReferencedEventInner'
import {Ago} from './row/Ago'
import {TimelineRow} from './row/TimelineRow'
import type {PreloadedSecondaryQueryType} from './secondary-timeline-query'

type ReferencedEventProps = {
  queryRef: ReferencedEvent$key
  rollupGroup?: Record<string, ReferencedEvent$key[]>
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  viewer: string | null
  secondaryTimelineQueryRef?: PreloadedSecondaryQueryType
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
const ReferencedEventFragment = graphql`
  fragment ReferencedEvent on ReferencedEvent {
    id
    databaseId
    willCloseSubject
    subject {
      __typename
    }
    actor {
      ...TimelineRowEventActor
    }
    commit {
      ...ReferencedEventInner
    }
    createdAt
  }
`

export function ReferencedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  rollupGroup,
  viewer,
  secondaryTimelineQueryRef,
}: ReferencedEventProps): React.ReactElement {
  const {actor, createdAt, commit, databaseId, subject, willCloseSubject, id} = useFragment(
    ReferencedEventFragment,
    queryRef,
  )

  if (commit === null) {
    return <></>
  }

  const highlighted = String(databaseId) === highlightedEventId
  const rolledUpGroup = rollupGroup && rollupGroup['ReferencedEvent'] ? rollupGroup['ReferencedEvent'] : [queryRef]
  const numItems = rolledUpGroup.length

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={issueUrl}
      onLinkClick={onLinkClick}
      showAgoTimestamp={false}
      leadingIcon={GitCommitIcon}
    >
      <TimelineRow.Main>
        {`${LABELS.timeline.addedCommitsThatReferences(numItems)} `}
        <Ago timestamp={new Date(createdAt)} linkUrl={createIssueEventExternalUrl(issueUrl, databaseId)} />
        <div className={styles.Box}>
          {rolledUpGroup.map((itemQueryRef, index) => (
            <ReferencedItem
              // eslint-disable-next-line @eslint-react/no-array-index-key
              key={`${databaseId}_${index}`}
              itemQueryRef={itemQueryRef}
              subjectType={subject.__typename}
              viewerLogin={viewer}
              eventId={id}
              willCloseSubject={willCloseSubject}
              secondaryTimelineQueryRef={secondaryTimelineQueryRef}
            />
          ))}
        </div>
      </TimelineRow.Main>
    </TimelineRow>
  )
}

function ReferencedItem({
  itemQueryRef,
  ...props
}: {itemQueryRef: ReferencedEvent$key} & Omit<ReferencedEventInnerProps, 'commitKey'>) {
  const {commit} = useFragment(ReferencedEventFragment, itemQueryRef)
  if (!commit) return null

  return <ReferencedEventInner commitKey={commit} {...props} />
}

/**
 * @generated SignedSource<<806f69c52f3e67059cc5f69833b0ab84>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type ReferencedEventInner$data = {
  readonly abbreviatedOid: string;
  readonly message: string;
  readonly messageBodyHTML: string;
  readonly messageHeadlineHTML: string;
  readonly repository: {
    readonly defaultBranch: string;
    readonly name: string;
    readonly owner: {
      readonly login: string;
    };
  };
  readonly url: string;
  readonly " $fragmentType": "ReferencedEventInner";
};
export type ReferencedEventInner$key = {
  readonly " $data"?: ReferencedEventInner$data;
  readonly " $fragmentSpreads": FragmentRefs<"ReferencedEventInner">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReferencedEventInner",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "message",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "messageHeadlineHTML",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "messageBodyHTML",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "url",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "abbreviatedOid",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "Repository",
      "kind": "LinkedField",
      "name": "repository",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "owner",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "login",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "defaultBranch",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Commit",
  "abstractKey": null
};

(node as any).hash = "89d6ea56d087536089c85b4dc325ea33";

export default node;

import {useGetHovercardAttributesForType} from '@github-ui/hovercards/use-get-hovercard-attributes-for-type'
import {MarkdownViewer} from '@github-ui/markdown-viewer'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {InfoIcon} from '@primer/octicons-react'
import {Button, Link, Truncate} from '@primer/react'
import {Tooltip} from '@primer/react/next'
import {useState} from 'react'
import {graphql, useFragment} from 'react-relay'

import {LABELS} from '../constants/labels'
import {VALUES} from '../constants/values'
import type {ReferencedEventInner$key} from './__generated__/ReferencedEventInner.graphql'
import styles from './ReferencedEventInner.module.css'
import {ReferencedEventVerificationStatus} from './ReferencedEventVerificationStatus'
import type {PreloadedSecondaryQueryType} from './secondary-timeline-query'

export type ReferencedEventInnerProps = {
  commitKey: ReferencedEventInner$key
  viewerLogin: string | null
  willCloseSubject: boolean
  subjectType: string
  eventId: string
  secondaryTimelineQueryRef?: PreloadedSecondaryQueryType
}

export function ReferencedEventInner({
  commitKey,
  willCloseSubject,
  viewerLogin,
  eventId,
  subjectType,
  secondaryTimelineQueryRef,
}: ReferencedEventInnerProps): React.ReactElement {
  const commit = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment ReferencedEventInner on Commit {
        message
        messageHeadlineHTML
        messageBodyHTML
        url
        abbreviatedOid
        repository {
          name
          owner {
            login
          }
          defaultBranch
        }
      }
    `,
    commitKey,
  )
  const getHovercardAttributesForType = useGetHovercardAttributesForType()
  const [showCommitBody, setShowCommitBody] = useState(false)

  if (commit === null) {
    return <></>
  }

  // Guard against missing repository data (can happen with deleted/inaccessible repos)
  const repository = commit.repository
  const defaultBranch = repository?.defaultBranch ?? ''
  const willCloseMessage = defaultBranch
    ? LABELS.commitWillCloseMessage(subjectType, commit.abbreviatedOid, defaultBranch)
    : ''

  const hovercardAttributes = repository
    ? getHovercardAttributesForType('commit', {
        owner: repository.owner.login,
        repo: repository.name,
        commitish: commit.abbreviatedOid,
      })
    : undefined

  return (
    <div className={styles.referencedCommitContainer}>
      <div className={styles.commitHeaderRow}>
        <div className={styles.commitMetadata}>
          <Truncate title={commit.message} className={styles.commitMessageText}>
            {hovercardAttributes ? (
              <Link
                href={commit.url}
                target="_blank"
                {...hovercardAttributes}
                muted
                aria-label={commit.message}
                className={styles.commitHashLink}
              >
                <MarkdownViewer
                  verifiedHTML={
                    // we can be sure this is a SafeHTMLString because the concatenated content comes from a trusted
                    // GitHub graphql query
                    // eslint-disable-next-line github/unescaped-html-literal, @github-ui/github-monorepo/no-cast-as-safe-html-string -- Composed from sanitized segments
                    `<p style="font-family:monospace;font-size:12px">${commit.messageHeadlineHTML}</p>` as SafeHTMLString
                  }
                />
              </Link>
            ) : (
              <MarkdownViewer
                verifiedHTML={
                  // we can be sure this is a SafeHTMLString because the concatenated content comes from a trusted
                  // GitHub graphql query
                  // eslint-disable-next-line github/unescaped-html-literal, @github-ui/github-monorepo/no-cast-as-safe-html-string -- Composed from sanitized segments
                  `<p style="font-family:monospace;font-size:12px">${commit.messageHeadlineHTML}</p>` as SafeHTMLString
                }
              />
            )}
          </Truncate>
          {commit.messageBodyHTML && (
            <Button
              size="small"
              onClick={() => setShowCommitBody(!showCommitBody)}
              aria-label={showCommitBody ? 'Hide commit message body' : 'Show commit message body'}
              aria-expanded={showCommitBody}
              className={styles.toggleButton}
            >
              ...
            </Button>
          )}
        </div>
        <div className={styles.commitActions}>
          {willCloseSubject && defaultBranch && (
            <Tooltip text={willCloseMessage} type="label">
              <Link href={VALUES.closingViaCommitMessageUrl} muted>
                <InfoIcon />
              </Link>
            </Tooltip>
          )}
          <ReferencedEventVerificationStatus
            secondaryTimelineQueryRef={secondaryTimelineQueryRef}
            eventId={eventId}
            viewerLogin={viewerLogin}
          />
          <Link href={commit.url} muted className={styles.repoNameLink}>
            {commit.abbreviatedOid}
          </Link>
        </div>
      </div>
      {showCommitBody && (
        <MarkdownViewer
          verifiedHTML={
            // we can be sure this is a SafeHTMLString because the concatenated content comes from a trusted
            // GitHub graphql query
            // eslint-disable-next-line github/unescaped-html-literal, @github-ui/github-monorepo/no-cast-as-safe-html-string -- Composed from sanitized segments
            `<p style="font-family:monospace;font-size:12px;white-space:pre-wrap">${commit.messageBodyHTML}</p>` as SafeHTMLString
          }
        />
      )}
    </div>
  )
}

import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {
  type CertificateAttributes,
  type CommitSignatureType,
  type SignatureResult,
  SignedCommitBadge,
  type VerificationStatus,
} from '@github-ui/signed-commit-badge'
import {Suspense} from 'react'
import {graphql, useFragment, usePreloadedQuery} from 'react-relay'

import {VALUES} from '../constants/values'
import type {
  ReferencedEventVerificationStatusInner$data,
  ReferencedEventVerificationStatusInner$key,
} from './__generated__/ReferencedEventVerificationStatusInner.graphql'
import type {secondaryTimelineQuery} from './__generated__/secondaryTimelineQuery.graphql'
import {ReferencedEventVerificationStatusFailure} from './ReferencedEventVerificationStatusFailure'
import {ReferencedEventVerificationStatusSkeleton} from './ReferencedEventVerificationStatusSkeleton'
import {type PreloadedSecondaryQueryType, SecondaryTimelineGraphqlQuery} from './secondary-timeline-query'

type SignatureResultFromFragment = NonNullable<ReferencedEventVerificationStatusInner$data['signature']>
type CertificateAttributesFromFragment = NonNullable<NonNullable<SignatureResultFromFragment>['subject']>

type ReferencedEventVerificationStatusProps = {
  secondaryTimelineQueryRef?: PreloadedSecondaryQueryType
  eventId: string
  viewerLogin: string | null
}

export function ReferencedEventVerificationStatus({
  secondaryTimelineQueryRef,
  eventId,
  viewerLogin,
}: ReferencedEventVerificationStatusProps): React.ReactElement | null {
  if (!secondaryTimelineQueryRef) return null
  return (
    <ErrorBoundary fallback={<ReferencedEventVerificationStatusFailure />}>
      <Suspense fallback={<ReferencedEventVerificationStatusSkeleton />}>
        <ReferencedEventVerificationStatusQuery
          secondaryTimelineQueryRef={secondaryTimelineQueryRef}
          eventId={eventId}
          viewerLogin={viewerLogin}
        />
      </Suspense>
    </ErrorBoundary>
  )
}

function ReferencedEventVerificationStatusQuery({
  secondaryTimelineQueryRef,
  eventId,
  viewerLogin,
}: {
  secondaryTimelineQueryRef: PreloadedSecondaryQueryType
  eventId: string
  viewerLogin: string | null
}): React.ReactElement | null {
  const {nodes} = usePreloadedQuery<secondaryTimelineQuery>(SecondaryTimelineGraphqlQuery, secondaryTimelineQueryRef)
  const commitNode = nodes?.find(node => node?.__id === eventId)

  if (!commitNode || !commitNode.commit) return null

  return <ReferencedEventVerificationStatusInner commitRef={commitNode.commit} viewerLogin={viewerLogin} />
}

function ReferencedEventVerificationStatusInner({
  commitRef,
  viewerLogin,
}: {
  commitRef: ReferencedEventVerificationStatusInner$key
  viewerLogin: string | null
}) {
  const commit = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment ReferencedEventVerificationStatusInner on Commit {
        abbreviatedOid
        hasSignature
        verificationStatus
        signature {
          __typename
          signer {
            login
            avatarUrl
          }
          state
          wasSignedByGitHub
          ... on SmimeSignature {
            issuer {
              commonName
              emailAddress
              organization
              organizationUnit
            }
            subject {
              commonName
              emailAddress
              organization
              organizationUnit
            }
          }
          ... on GpgSignature {
            keyId
          }
          ... on SshSignature {
            keyFingerprint
          }
        }
      }
    `,
    commitRef,
  )

  if (
    !commit ||
    !commit.signature ||
    !commit.verificationStatus ||
    commit.verificationStatus === 'UNSIGNED' ||
    !commit.abbreviatedOid ||
    commit.hasSignature === undefined
  ) {
    return null
  }
  return (
    <SignedCommitBadge
      commitOid={commit.abbreviatedOid}
      hasSignature={commit.hasSignature}
      verificationStatus={getVerificationStatus(commit.verificationStatus)}
      signature={getSignatureResult(commit.signature, viewerLogin)}
    />
  )
}

function getVerificationStatus(verificationStatus: string): VerificationStatus {
  switch (verificationStatus) {
    case 'VERIFIED':
      return 'verified'
    case 'UNVERIFIED':
      return 'unverified'
    case 'PARTIALLY_VERIFIED':
      return 'partially_verified'
    default:
      return 'unsigned'
  }
}

function getSignatureResult(signature: SignatureResultFromFragment, viewerLogin: string | null): SignatureResult {
  return {
    hasSignature: true,
    helpUrl: VALUES.commitBadgeHelpUrl,
    isViewer: !!signature.signer && viewerLogin === signature.signer.login,
    keyExpired: signature.state === 'EXPIRED_KEY',
    // keyId isn't used for S/MIME signatures
    keyId: (signature.__typename === 'GpgSignature' ? signature.keyId : signature.keyFingerprint) ?? '',
    keyRevoked: signature.state === 'OCSP_REVOKED',
    signedByGitHub: signature.wasSignedByGitHub,
    signerLogin: signature.signer?.login ?? '',
    signerAvatarUrl: signature.signer?.avatarUrl ?? '',
    signatureType: signature.__typename as CommitSignatureType,
    signatureCertificateSubject: toCertificateAttributes(signature.subject),
    signatureCertificateIssuer: toCertificateAttributes(signature.issuer),
    signatureVerificationReason: signature.state,
  }
}

function toCertificateAttributes(attributes?: CertificateAttributesFromFragment | null): CertificateAttributes {
  if (!attributes) {
    return {}
  }

  return {
    common_name: attributes.commonName ?? undefined,
    email_address: attributes.emailAddress ?? undefined,
    organization: attributes.organization ?? undefined,
    organization_unit: attributes.organizationUnit ?? undefined,
  }
}

import {AlertIcon} from '@primer/octicons-react'

import styles from './ReferencedEventInner.module.css'

export function ReferencedEventVerificationStatusFailure(): React.ReactElement {
  return (
    <span
      className={styles.referencedEventVerificationStatusFailure}
      data-testid="referenced-event-verification-status-failure"
    >
      <AlertIcon size={16} /> Error
    </span>
  )
}

import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'

export function ReferencedEventVerificationStatusSkeleton(): React.ReactElement {
  return <LoadingSkeleton variant="pill" height="md" width="60px" />
}

// used for test mocking
export function reloadPage() {
  window.location.reload()
}

/**
 * @generated SignedSource<<5d952d1064259aad3c9810177e52e840>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type RemovedFromProjectV2Event$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly project: {
    readonly title: string;
    readonly url: string;
  } | null | undefined;
  readonly " $fragmentType": "RemovedFromProjectV2Event";
};
export type RemovedFromProjectV2Event$key = {
  readonly " $data"?: RemovedFromProjectV2Event$data;
  readonly " $fragmentSpreads": FragmentRefs<"RemovedFromProjectV2Event">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RemovedFromProjectV2Event",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "ProjectV2",
      "kind": "LinkedField",
      "name": "project",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "title",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "url",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "RemovedFromProjectV2Event",
  "abstractKey": null
};

(node as any).hash = "93b212ec62b6f7cb3f7acfc9102277db";

export default node;

import {TableIcon} from '@primer/octicons-react'
import {Fragment} from 'react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import type {RemovedFromProjectV2Event$key} from './__generated__/RemovedFromProjectV2Event.graphql'
import {ProjectV2} from './ProjectV2'
import styles from './RemovedFromProjectV2Event.module.css'
import {RolledupProjectV2Event} from './RolledupProjectV2Event'
import {TimelineRow} from './row/TimelineRow'

type RemovedFromProjectV2EventProps = {
  queryRef: RemovedFromProjectV2Event$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  rollupGroup?: Record<string, Array<RemovedFromProjectV2Event$key | RemovedFromProjectV2Event$key>>
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
const RemovedFromProjectV2EventFragment = graphql`
  fragment RemovedFromProjectV2Event on RemovedFromProjectV2Event {
    createdAt
    actor {
      ...TimelineRowEventActor
    }
    project {
      title
      url
    }
  }
`

export function RemovedFromProjectV2Event({
  queryRef,
  issueUrl,
  onLinkClick,
  rollupGroup,
}: RemovedFromProjectV2EventProps): React.ReactElement {
  const {actor, createdAt, project} = useFragment(RemovedFromProjectV2EventFragment, queryRef)

  if (!project) {
    return <></>
  }

  // Once we have support for the project IDs being exposed in GQL we can shift to using the
  // `issueEventExternalUrl` function here for our deep linked timestamp.
  return (
    <TimelineRow
      highlighted={false}
      actor={actor}
      onLinkClick={onLinkClick}
      createdAt={createdAt}
      deepLinkUrl={issueUrl}
      leadingIcon={TableIcon}
    >
      <TimelineRow.Main>
        {rollupGroup ? (
          <RolledupProjectV2Event rollupGroup={rollupGroup} />
        ) : (
          <RemovedFromProjectV2sRendering queryRefs={[queryRef]} />
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

export const RemovedFromProjectV2sRendering = ({queryRefs}: {queryRefs: RemovedFromProjectV2Event$key[]}) => {
  if (queryRefs.length === 0) {
    return null
  }

  return (
    <>
      {`${LABELS.timeline.removedThisFrom} `}
      {queryRefs.map((queryRef, index) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key
        <Fragment key={index}>
          <InternalRemovedFromProjectV2sRendering
            queryRef={queryRef}
            first={index === 0}
            last={index === queryRefs.length - 1}
          />
        </Fragment>
      ))}
    </>
  )
}

const InternalRemovedFromProjectV2sRendering = ({
  queryRef,
  first,
  last,
}: Pick<RemovedFromProjectV2EventProps, 'queryRef'> & {
  first: boolean
  last: boolean
}) => {
  const {project} = useFragment(RemovedFromProjectV2EventFragment, queryRef)

  if (!project?.title || !project?.url) {
    return null
  }

  return (
    <span className={styles.Text}>
      <>
        {!first && !last && <span className={styles.Text_1}>,</span>}
        {!first && last && <span className={styles.Text_2}>{LABELS.timeline.and}</span>}
        <ProjectV2 title={project?.title} url={project?.url} />
      </>
    </span>
  )
}

/**
 * @generated SignedSource<<5e8014afad693316948e315dea9e15bb>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type RenamedTitleEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly currentTitle: string;
  readonly databaseId: number | null | undefined;
  readonly previousTitle: string;
  readonly " $fragmentType": "RenamedTitleEvent";
};
export type RenamedTitleEvent$key = {
  readonly " $data"?: RenamedTitleEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"RenamedTitleEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RenamedTitleEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "currentTitle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "previousTitle",
      "storageKey": null
    }
  ],
  "type": "RenamedTitleEvent",
  "abstractKey": null
};

(node as any).hash = "51c475b1e987f59acbc80c0754983081";

export default node;

import {PencilIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {RenamedTitleEvent$key} from './__generated__/RenamedTitleEvent.graphql'
import styles from './RenamedTitleEvent.module.css'
import {TimelineRow} from './row/TimelineRow'

type RenamedTitleEventProps = {
  queryRef: RenamedTitleEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function RenamedTitleEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: RenamedTitleEventProps): React.ReactElement {
  const {actor, createdAt, currentTitle, previousTitle, databaseId} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment RenamedTitleEvent on RenamedTitleEvent {
        databaseId
        createdAt
        actor {
          ...TimelineRowEventActor
        }
        currentTitle
        previousTitle
      }
    `,
    queryRef,
  )

  const highlighted = String(databaseId) === highlightedEventId
  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={PencilIcon}
    >
      <TimelineRow.Main>
        {LABELS.timeline.renamedTitle}{' '}
        <span className={styles.defaultColor}>
          <del className={styles.strikeThrough}>
            <span className="sr-only">[-]</span>
            {previousTitle}
            <span className="sr-only">[/-]</span>
          </del>
        </span>{' '}
        <span className={styles.defaultColor}>
          <ins className={styles.noUnderline}>
            <span className="sr-only">[+]</span>
            {currentTitle}
            <span className="sr-only">[/+]</span>
          </ins>
        </span>{' '}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

/**
 * @generated SignedSource<<5d145924723e829f40768994e23bb289>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type ReopenedEvent$data = {
  readonly actor: {
    readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
  } | null | undefined;
  readonly createdAt: string;
  readonly databaseId: number | null | undefined;
  readonly " $fragmentType": "ReopenedEvent";
};
export type ReopenedEvent$key = {
  readonly " $data"?: ReopenedEvent$data;
  readonly " $fragmentSpreads": FragmentRefs<"ReopenedEvent">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReopenedEvent",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "databaseId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actor",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "TimelineRowEventActor"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "ReopenedEvent",
  "abstractKey": null
};

(node as any).hash = "0ef236ccb5e3252ae1b2405be2bddad5";

export default node;

import {IssueReopenedIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {ReopenedEvent$key} from './__generated__/ReopenedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'

export type ReopenedEventProps = {
  queryRef: ReopenedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function ReopenedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: ReopenedEventProps): React.ReactElement {
  const {actor, createdAt, databaseId} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment ReopenedEvent on ReopenedEvent {
        databaseId
        createdAt
        actor {
          ...TimelineRowEventActor
        }
      }
    `,
    queryRef,
  )

  const highlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      iconColoring={{backgroundColor: 'open.fg', color: 'white'}}
      leadingIcon={IssueReopenedIcon}
    >
      <TimelineRow.Main>
        <span>{LABELS.timeline.reopenedThis} </span>
      </TimelineRow.Main>
    </TimelineRow>
  )
}

import {LABELS} from '../constants/labels'
import type {AssignedEvent$key} from './__generated__/AssignedEvent.graphql'
import type {UnassignedEvent$key} from './__generated__/UnassignedEvent.graphql'
import {AddedAssigneesRendering} from './AssignedEvent'
import {RemovedAssigneesRendering} from './UnassignedEvent'

type AssignedEventProps = {
  rollupGroup: Record<string, Array<AssignedEvent$key | UnassignedEvent$key>>
}
export function RolledupAssignedEvent({rollupGroup}: AssignedEventProps): React.ReactElement {
  const addedEvents = (rollupGroup['AssignedEvent'] as AssignedEvent$key[]) || []
  const removedEvents = (rollupGroup['UnassignedEvent'] as UnassignedEvent$key[]) || []

  return (
    <>
      <AddedAssigneesRendering queryRefs={addedEvents} selfAssigned={false} rollup />
      {addedEvents.length > 0 && removedEvents.length > 0 && ` ${LABELS.timeline.and} `}
      <RemovedAssigneesRendering queryRefs={removedEvents} selfAssigned={false} rollup />
    </>
  )
}

import {IssueFieldSingleSelectValueToken} from '@github-ui/issue-metadata/IssueFieldSingleSelectValueToken'
import {Link} from '@primer/react'
import {useFragment} from 'react-relay'

import {LABELS} from '../constants/labels'
import type {IssueFieldAddedEvent$key} from './__generated__/IssueFieldAddedEvent.graphql'
import type {IssueFieldChangedEvent$key} from './__generated__/IssueFieldChangedEvent.graphql'
import type {IssueFieldRemovedEvent$key} from './__generated__/IssueFieldRemovedEvent.graphql'
import {IssueFieldAddedEventFragment} from './IssueFieldAddedEvent'
import {IssueFieldChangedEventFragment} from './IssueFieldChangedEvent'
import {getSearchLink} from './IssueFieldEvent'
import styles from './IssueFieldEvent.module.css'
import {IssueFieldRemovedEventFragment} from './IssueFieldRemovedEvent'

type IssueFieldEventKey = IssueFieldAddedEvent$key | IssueFieldChangedEvent$key | IssueFieldRemovedEvent$key

type RolledupIssueFieldEventProps = {
  rollupGroup: Record<string, IssueFieldEventKey[]>
  repositoryNameWithOwner?: string
}

/**
 * Renders a bundled summary of multiple issue field changes.
 *
 * Example output: "updated Product pillar Copilot Intelligence Platform, Trending At risk and Deliverable Staffship/Internal Release, and also removed Eng Staffing"
 */
export function RolledupIssueFieldEvent({
  rollupGroup,
  repositoryNameWithOwner,
}: RolledupIssueFieldEventProps): React.ReactElement | null {
  const addedEvents = (rollupGroup['IssueFieldAddedEvent'] as IssueFieldAddedEvent$key[]) || []
  const changedEvents = (rollupGroup['IssueFieldChangedEvent'] as IssueFieldChangedEvent$key[]) || []
  const removedEvents = (rollupGroup['IssueFieldRemovedEvent'] as IssueFieldRemovedEvent$key[]) || []

  const hasUpdated = addedEvents.length > 0 || changedEvents.length > 0
  const hasRemoved = removedEvents.length > 0
  const hasContent = hasUpdated || hasRemoved

  if (!hasContent) {
    return null
  }

  return (
    <>
      {hasUpdated && (
        <>
          {`${LABELS.timeline.issueFieldRollup.updated} `}
          <UpdatedFieldsList
            addedEvents={addedEvents}
            changedEvents={changedEvents}
            repositoryNameWithOwner={repositoryNameWithOwner}
          />
        </>
      )}
      {hasUpdated && hasRemoved && `, ${LABELS.timeline.issueFieldRollup.andAlso} `}
      {hasRemoved && (
        <>
          {`${LABELS.timeline.issueFieldRollup.removed} `}
          <RemovedFieldsList removedEvents={removedEvents} />
        </>
      )}{' '}
    </>
  )
}

type UpdatedFieldsListProps = {
  addedEvents: IssueFieldAddedEvent$key[]
  changedEvents: IssueFieldChangedEvent$key[]
  repositoryNameWithOwner?: string
}

function UpdatedFieldsList({addedEvents, changedEvents, repositoryNameWithOwner}: UpdatedFieldsListProps) {
  const totalCount = addedEvents.length + changedEvents.length

  return (
    <>
      {addedEvents.map((eventKey, index) => {
        const isLastOverall = index === totalCount - 1
        const isSecondToLastOverall = index === totalCount - 2
        const eventIndex = (eventKey as {__index?: number}).__index ?? index
        return (
          <AddedFieldItem
            key={`added-${eventIndex}`}
            eventKey={eventKey}
            repositoryNameWithOwner={repositoryNameWithOwner}
            isLast={isLastOverall}
            isSecondToLast={isSecondToLastOverall}
          />
        )
      })}
      {changedEvents.map((eventKey, index) => {
        const globalIndex = addedEvents.length + index
        const isLastOverall = globalIndex === totalCount - 1
        const isSecondToLastOverall = globalIndex === totalCount - 2
        const eventIndex = (eventKey as {__index?: number}).__index ?? index
        return (
          <ChangedFieldItem
            key={`changed-${eventIndex}`}
            eventKey={eventKey}
            repositoryNameWithOwner={repositoryNameWithOwner}
            isLast={isLastOverall}
            isSecondToLast={isSecondToLastOverall}
          />
        )
      })}
    </>
  )
}

type RemovedFieldsListProps = {
  removedEvents: IssueFieldRemovedEvent$key[]
}

function RemovedFieldsList({removedEvents}: RemovedFieldsListProps) {
  return (
    <>
      {removedEvents.map((eventKey, index) => {
        const eventIndex = (eventKey as {__index?: number}).__index ?? index
        return (
          <RemovedFieldItem
            key={`removed-${eventIndex}`}
            eventKey={eventKey}
            isLast={index === removedEvents.length - 1}
            isSecondToLast={index === removedEvents.length - 2}
          />
        )
      })}
    </>
  )
}

type AddedFieldItemProps = {
  eventKey: IssueFieldAddedEvent$key
  repositoryNameWithOwner?: string
  isLast: boolean
  isSecondToLast: boolean
}

function AddedFieldItem({eventKey, repositoryNameWithOwner, isLast, isSecondToLast}: AddedFieldItemProps) {
  const data = useFragment(IssueFieldAddedEventFragment, eventKey)

  if (!data.issueField?.name || !data.issueField?.dataType) return null

  const separator = isLast ? '' : isSecondToLast ? ` ${LABELS.timeline.and} ` : ', '
  const searchLink = getSearchLink(repositoryNameWithOwner, data.issueField.name, data.value ?? undefined)
  const isSingleSelect = data.issueField.dataType === 'SINGLE_SELECT'

  return (
    <span className={styles.issueFieldRollupValueWrapper}>
      <span className={styles.rollupFieldName}>{data.issueField.name}</span>
      {data.value && (
        <span>
          {' '}
          {isSingleSelect ? (
            <Link href={searchLink} className={styles.inlineToken}>
              <IssueFieldSingleSelectValueToken
                name={data.value}
                color={data.color || ''}
                getTooltipText={() => undefined}
              />
            </Link>
          ) : (
            <Link href={searchLink} inline className={styles.issueFieldValueLink}>
              {data.value}
            </Link>
          )}
        </span>
      )}
      {separator}
    </span>
  )
}

type ChangedFieldItemProps = {
  eventKey: IssueFieldChangedEvent$key
  repositoryNameWithOwner?: string
  isLast: boolean
  isSecondToLast: boolean
}

function ChangedFieldItem({eventKey, repositoryNameWithOwner, isLast, isSecondToLast}: ChangedFieldItemProps) {
  const data = useFragment(IssueFieldChangedEventFragment, eventKey)

  if (!data.issueField?.name || !data.issueField?.dataType) return null

  const separator = isLast ? '' : isSecondToLast ? ` ${LABELS.timeline.and} ` : ', '
  const searchLink = getSearchLink(repositoryNameWithOwner, data.issueField.name, data.newValue ?? undefined)
  const isSingleSelect = data.issueField.dataType === 'SINGLE_SELECT'

  return (
    <span className={styles.issueFieldRollupValueWrapper}>
      <span className={styles.rollupFieldName}>{data.issueField.name}</span>
      {data.newValue && (
        <span>
          {' '}
          {isSingleSelect ? (
            <Link href={searchLink} className={styles.inlineToken}>
              <IssueFieldSingleSelectValueToken
                name={data.newValue}
                color={data.newColor || ''}
                getTooltipText={() => undefined}
              />
            </Link>
          ) : (
            <Link href={searchLink} inline className={styles.issueFieldValueLink}>
              {data.newValue}
            </Link>
          )}
        </span>
      )}
      {separator}
    </span>
  )
}

type RemovedFieldItemProps = {
  eventKey: IssueFieldRemovedEvent$key
  isLast: boolean
  isSecondToLast: boolean
}

function RemovedFieldItem({eventKey, isLast, isSecondToLast}: RemovedFieldItemProps) {
  const data = useFragment(IssueFieldRemovedEventFragment, eventKey)

  if (!data.issueField?.name) return null

  const separator = isLast ? '' : isSecondToLast ? ` ${LABELS.timeline.and} ` : ', '

  return (
    <span className={styles.issueFieldRollupValueWrapper}>
      <span className={styles.rollupFieldName}>{data.issueField.name}</span>
      {separator}
    </span>
  )
}

import {LABELS} from '../constants/labels'
import type {LabeledEvent$key} from './__generated__/LabeledEvent.graphql'
import type {UnlabeledEvent$key} from './__generated__/UnlabeledEvent.graphql'
import {AddedLabelsRendering} from './LabeledEvent'
import {UnlabeledRendering} from './UnlabeledEvent'

type LabeledEventProps = {
  rollupGroup: Record<string, Array<LabeledEvent$key | UnlabeledEvent$key>>
  timelineEventBaseUrl: string
}
export function RolledupLabeledEvent({rollupGroup, timelineEventBaseUrl}: LabeledEventProps): React.ReactElement {
  const addedEvents = (rollupGroup['LabeledEvent'] as LabeledEvent$key[]) || []
  const removedEvents = (rollupGroup['UnlabeledEvent'] as UnlabeledEvent$key[]) || []

  return (
    <>
      <AddedLabelsRendering queryRefs={addedEvents} timelineEventBaseUrl={timelineEventBaseUrl} />
      {addedEvents.length > 0 && removedEvents.length > 0 && `${LABELS.timeline.and} `}
      <UnlabeledRendering queryRefs={removedEvents} timelineEventBaseUrl={timelineEventBaseUrl} />
    </>
  )
}

import {useFragment} from 'react-relay'

import {LABELS} from '../constants/labels'
import type {DemilestonedEvent$key} from './__generated__/DemilestonedEvent.graphql'
import type {MilestonedEvent$key} from './__generated__/MilestonedEvent.graphql'
import {getWrappedMilestoneLink} from './DemilestonedEvent'
import {MilestonedEventFragment} from './MilestonedEvent'

type RolledupMilestonedEventProps = {
  rollupGroup: Record<string, Array<MilestonedEvent$key | DemilestonedEvent$key>>
}

type MilestoneLinkProps = {
  milestoneEventKey: MilestonedEvent$key | DemilestonedEvent$key
  addDelimiter: boolean
}

type WithAttributes<T> = T & {
  // __id is used for the unique key for the element
  __id: string
  // __index is used for sorting the events
  __index: number
  // milestone is used to remove duplicates when it exists
  milestone?: {
    id: string
  }
  // milestoneTitle is used as a fallback for milestone?.id as the milestone may have been deleted
  milestoneTitle: string
}

export function RolledupMilestonedEvent({rollupGroup}: RolledupMilestonedEventProps): React.ReactElement {
  const addedEvents = (rollupGroup['MilestonedEvent'] as Array<WithAttributes<MilestonedEvent$key>>) || []
  const removedEvents = (rollupGroup['DemilestonedEvent'] as Array<WithAttributes<DemilestonedEvent$key>>) || []

  const sortedEvents = getSortedEvents(addedEvents, removedEvents)

  const prefix = sortedEvents.length > 1 ? LABELS.timeline.modifiedMilestones : LABELS.timeline.modifiedMilestone

  return (
    <>
      {`${prefix} `}
      {sortedEvents.map((event, index) => (
        <MilestoneLink milestoneEventKey={event} key={event.__id} addDelimiter={index < sortedEvents.length - 1} />
      ))}
    </>
  )
}

// This function is used to sort the events by their index in the timeline and remove duplicates by milestone id (only the first event is kept)
function getSortedEvents(
  addedEvents: Array<WithAttributes<MilestonedEvent$key>>,
  removedEvents: Array<WithAttributes<DemilestonedEvent$key>>,
) {
  const eventOrder: Record<string, number> = {}
  const eventKeys: Record<string, WithAttributes<MilestonedEvent$key> | WithAttributes<DemilestonedEvent$key>> = {}

  const allEvents = [...addedEvents, ...removedEvents]

  for (const event of allEvents) {
    const id = event.milestone?.id || event.milestoneTitle
    const eventIndex = eventOrder[id]
    if (eventIndex === undefined || event.__index < eventIndex) {
      eventOrder[id] = event.__index
      eventKeys[id] = event
    }
  }

  return Object.entries(eventOrder)
    .sort((a, b) => a[1] - b[1])
    .map(([id]) => eventKeys[id])
    .filter(event => event !== undefined)
}

function MilestoneLink({milestoneEventKey, addDelimiter}: MilestoneLinkProps) {
  const data = useFragment(MilestonedEventFragment, milestoneEventKey)

  return getWrappedMilestoneLink(data.milestone?.url, data.milestoneTitle, addDelimiter)
}

/* eslint eslint-comments/no-use: off */
import {LABELS} from '../constants/labels'
import type {AddedToProjectV2Event$key} from './__generated__/AddedToProjectV2Event.graphql'
import type {RemovedFromProjectV2Event$key} from './__generated__/RemovedFromProjectV2Event.graphql'
import {AddedToProjectV2sRendering} from './AddedToProjectV2Event'
import {RemovedFromProjectV2sRendering} from './RemovedFromProjectV2Event'

type RolledupProjectV2EventProps = {
  rollupGroup: Record<string, Array<AddedToProjectV2Event$key | RemovedFromProjectV2Event$key>>
}

export function RolledupProjectV2Event({rollupGroup}: RolledupProjectV2EventProps): React.ReactElement {
  const addedEvents = (rollupGroup['AddedToProjectV2Event'] as AddedToProjectV2Event$key[]) || []
  const removedEvents = (rollupGroup['RemovedFromProjectV2Event'] as RemovedFromProjectV2Event$key[]) || []

  return (
    <>
      <AddedToProjectV2sRendering queryRefs={addedEvents} />
      {addedEvents.length > 0 && removedEvents.length > 0 && ` ${LABELS.timeline.and} `}
      <RemovedFromProjectV2sRendering queryRefs={removedEvents} />
    </>
  )
}

import type {PolymorphicProps} from '@github-ui/react-polymorphic'
import {useIgnoreKeyboardActionsWhileComposing} from '@github-ui/use-ignore-keyboard-actions-while-composing'
import {useTrackingRef} from '@github-ui/use-tracking-ref'
import {useRefObjectAsForwardedRef} from '@primer/react'
import React, {useCallback, useEffect, useId, useMemo, useRef, useState} from 'react'

import {CommandEvent, CommandEventHandlersMap} from '../command-event'
import type {CommandId} from '../commands'
import {CommandsContextProvider, useCommandsContext} from '../commands-context'
import {useRegisterCommands} from '../commands-registry'
import {recordCommandTriggerEvent} from '../metrics'
import {useDetectConflicts} from '../use-detect-conflicts'
import {useOnKeyDown} from '../use-on-key-down'

interface ScopedCommandsOwnProps {
  /** Map of command IDs to the corresponding event handler. */
  commands: CommandEventHandlersMap
}

export type ScopedCommandsProps<As extends React.ElementType = 'div'> = PolymorphicProps<
  As,
  Omit<LimitKeybindingScopeOwnProps, 'commandIds'> & ScopedCommandsOwnProps
>

const emptyLimitedScopeMap: ReadonlyMap<string, CommandId[]> = new Map()

// See export at end of file for docstring
const ScopedCommandsComponent = <As extends React.ElementType = 'div'>({
  ref: forwardedRef,
  commands,
  ...props
}: ScopedCommandsProps<As>) => {
  // We store the commands object in a ref so the context won't change on every render and recalculate the whole child tree
  const commandsRef = useTrackingRef(commands)

  const parentContext = useCommandsContext()

  const triggerCommand = useCallback(
    <T extends CommandId>(commandId: T, domEvent: KeyboardEvent | MouseEvent, isLimitedScope = false) => {
      const handler = commandsRef.current[commandId]

      if (handler) {
        const event = new CommandEvent(commandId)
        try {
          handler(event)
        } finally {
          recordCommandTriggerEvent(event, domEvent)
        }
      } else {
        // no handler here, pass it on up
        return parentContext.triggerCommand(commandId, domEvent, isLimitedScope)
      }
    },
    [commandsRef, parentContext],
  )

  useDetectConflicts('scoped', commands)

  useRegisterCommands(commands)

  const [limitedScopeMap, setLimitedScopeMap] = useState(emptyLimitedScopeMap)
  const registerLimitedKeybindingScope = useCallback(
    (uniqueKey: string, newIds: CommandId[]) =>
      setLimitedScopeMap(map => {
        const currentIds = map.get(uniqueKey)
        // avoid unnecessary updates if the new value is the same as the old
        if (newIds.length === currentIds?.length && newIds.every((id, i) => currentIds[i] === id)) return map
        return new Map([...map, [uniqueKey, newIds]])
      }),
    [],
  )

  /** The set of command IDs that are not limited in scope and should be registered at this level. */
  const commandIdsWithoutLimitedScope = useMemo(() => {
    const commandIdsWithLimitedScope = new Set(Array.from(limitedScopeMap.values()).flat())
    return CommandEventHandlersMap.keys(commands).filter(
      id => commands[id] !== undefined && !commandIdsWithLimitedScope.has(id),
    )
  }, [commands, limitedScopeMap])

  const contextValue = useMemo(
    () => ({triggerCommand, registerLimitedKeybindingScope}),
    [triggerCommand, registerLimitedKeybindingScope],
  )

  return (
    <CommandsContextProvider value={contextValue}>
      <KeybindingScope commandIds={commandIdsWithoutLimitedScope} {...props} ref={forwardedRef} />
    </CommandsContextProvider>
  )
}
ScopedCommandsComponent.displayName = 'ScopedCommands'

interface LimitKeybindingScopeOwnProps {
  /** List of command IDs to be scope-limited by this component. */
  commandIds: CommandId[]
  /**
   * Execute command handlers even if the underlying keyboard event was `defaultPrevented`.
   * @deprecated Avoid: Event handlers should always respect `defaultPrevented`. This escape hatch is provided for
   * backwards compatibility where command keybindings conflict with other event handling code. Eventually the
   * conflicts should be resolved and this prop removed.
   * @default false
   */
  triggerOnDefaultPrevented?: boolean
  // 🧙 You Shall Not Pass:
  onCompositionStart?: never
  onCompositionEnd?: never
  onKeyDown?: never
}

export type LimitKeybindingScopeProps<As extends React.ElementType = 'div'> = PolymorphicProps<
  As,
  LimitKeybindingScopeOwnProps
>

interface KeybindingScopeOwnProps extends LimitKeybindingScopeOwnProps {
  limited?: boolean
}

type KeybindingScopeProps<As extends React.ElementType = 'div'> = PolymorphicProps<As, KeybindingScopeOwnProps>

/**
 * Internal: binds keyboard event listeners for the given command IDs, using handlers from context.
 *
 * Unlike `LimitKeybindingScope`, this doesn't register the commands as limited-scope, so it can be shared with
 * `ScopedCommands`.
 */
const KeybindingScope = ({
  ref: forwardedRef,
  commandIds: commands,
  as,
  limited = false,
  triggerOnDefaultPrevented,
  ...props
}: KeybindingScopeProps) => {
  const parentContext = useCommandsContext()

  const triggerCommand = useCallback(
    (id: CommandId, domEvent: KeyboardEvent | MouseEvent) => parentContext.triggerCommand(id, domEvent, limited),
    [parentContext, limited],
  )

  const onKeyDown = useOnKeyDown(commands, triggerCommand, {triggerOnDefaultPrevented})

  const keyDownProps = useIgnoreKeyboardActionsWhileComposing(onKeyDown)

  const containerRef = useRef<HTMLDivElement>(null)
  useRefObjectAsForwardedRef(forwardedRef ?? null, containerRef)

  // Events first bubble up the DOM tree, then React handles them at the document level and rebuilds a 'synthetic'
  // JSX tree. If we only handle our events with React, we cannot stop native DOM handlers from capturing those events
  // first, even if we `stopPropagation`. For example, `@primer/behaviors` uses DOM handlers. So must handle events
  // with DOM handlers so we can 'get to them first'. However, this is not good enough because with scoped commands we
  // want the user to be able to fire commands when their focus is inside a menu overlay. This only works with React
  // handlers because overlays are rendered inside Portals. So we must bind _both_ DOM and React handlers, allowing
  // `useOnKeyDown` to handle ignoring duplicates.
  useEffect(() => {
    const target = containerRef.current
    // we are lying by passing DOM events to a React handler, but it works in this case because the handler we passed in can accept DOM events
    const handler = keyDownProps.onKeyDown as unknown as (e: KeyboardEvent) => void
    if (!target) return

    target.addEventListener('keydown', handler)
    return () => target.removeEventListener('keydown', handler)
  })

  // Typically we want to avoid `display: contents` due to its rocky history in terms of web browser accessibility
  // support. We've seen bugs appear, get fixed, and then regress again with this property. Unfortunately, there's no
  // good alternative here. We must wrap contents in some element to intercept keyboard shortcuts, and wrapping
  // contents in an element inherently introduces potential style and layout breaks. The only way to avoid that is
  // with `display: contents`; otherwise consumers will have to deal with fixing everything that this breaks every time
  // they use this component and they will be discouraged from adopting the new platform.
  //
  // If `as` is set to something other than `div`, or if a className was passed to explicitly set some styling, we don't do this,
  // because we assume the consumer is now thinking about styling and expects an element to appear.
  //
  // IMPORTANT: even with this in place, adding a div can still break some css rules, so be careful when using this.
  // for example:
  // - If the wrapped component has a selector such as `:not(:first-child)`, it will break since it will now be the first child
  // - If the parent has any direct decendant selectors, they will now be broken
  //
  // Before using, the best approach is to inspect the elements in the browser dev tools and look for any css rules that
  // might be affected by this change.
  const style = as !== undefined || props.className !== undefined ? undefined : {display: 'contents'}
  const Wrapper: React.ElementType = as ?? 'div'

  return <Wrapper style={style} {...props} {...keyDownProps} ref={containerRef} />
}
KeybindingScope.displayName = 'KeyboardScope'

/**
 * By default, `ScopedCommands` will bind keybinding handlers for its entire child tree. This usually works fine, but
 * sometimes you need to render a command-bound component outside of the desired keybinding area. For this case, you
 * can limit the keybinding area of certain commands by wrapping the desired area in `ScopedCommands.LimitKeybindingScope`.
 *
 * For example, here the `CommandButton` component has access to the "format bold" command but is not included in the
 * keybinding scope -- the keybinding for bold formatting can only be triggered when focus is inside the input. On the
 * other hand, the "submit" keybinding can be triggered anywhere inside the scope:
 *
 * ```
 * <ScopedCommands commands={{'comment-box:format-bold': handleFormatBold, 'comment-box:submit': handleSubmit}}>
 *   <CommandButton commandId="comment-box:format-bold" />
 *
 *   <ScopedCommands.LimitKeybindingScope commands={["comment-box:format-bold"]}>
 *     <textarea />
 *   </ScopedCommands.LimitKeybindingScope>
 * </ScopedCommands>
 * ```
 */
const LimitKeybindingScope = <As extends React.ElementType = 'div'>({
  ref: forwardedRef,
  commandIds: commands,
  ...props
}: LimitKeybindingScopeProps<As>) => {
  const parentContext = useCommandsContext()

  // Careful: registering these commands triggers the ScopedCommands component to update state which in turn causes
  // this component to re-render - this can easily cause an infinite render loop if we aren't cautious
  const uniqueKey = useId()
  useEffect(
    () => parentContext.registerLimitedKeybindingScope(uniqueKey, commands),
    [parentContext, commands, uniqueKey],
  )
  // Cleanup is a separate effect to avoid a dependency on `commands`; this way we don't double-call on every change
  // (once with an empty array and then again with the new array)
  // This also allows for optimizing inside ScopedCommands to avoid extra renders when the array values don't change
  useEffect(() => () => parentContext.registerLimitedKeybindingScope(uniqueKey, []), [parentContext, uniqueKey])

  return <KeybindingScope limited commandIds={commands} {...props} ref={forwardedRef} />
}
LimitKeybindingScope.displayName = 'LimitKeybindingScope'

/**
 * Provide command handlers that only work when focus is within a certain part of the React component tree.
 *
 * NOTE: By default this component will wrap contents in a `div` with `display: contents`. In certain cases this breaks
 * the page's HTML structure (for example, when wrapping list items or table cells). In this case the component element
 * type can be overridden with `as`.
 * @example
 * <ScopedCommands commands={{
 *   'comment-box:format-bold': handleFormatBold
 * }}>
 *   <textarea></textarea>
 * </ScopedCommands>
 */
export const ScopedCommands = Object.assign(ScopedCommandsComponent, {
  LimitKeybindingScope,
})

/* eslint-disable relay/must-colocate-fragment-spreads */
/* eslint eslint-comments/no-use: off */
/* eslint-disable relay/unused-fields */
/* To avoid a circular dependency between the timeline-items and issue viewer packages we can not colocate the fragments or put the fields next to where they are used. */

import {type PreloadedQuery, useQueryLoader} from 'react-relay'
import {graphql} from 'relay-runtime'

import type {secondaryTimelineQuery} from './__generated__/secondaryTimelineQuery.graphql'

export type PreloadedSecondaryQueryType = PreloadedQuery<secondaryTimelineQuery>
// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
export const SecondaryTimelineGraphqlQuery = graphql`
  query secondaryTimelineQuery($nodes: [ID!]!) {
    nodes(ids: $nodes) {
      ... on ReferencedEvent {
        __id
        commit {
          ...ReferencedEventVerificationStatusInner
        }
      }
    }
  }
`
export function useSecondaryTimelineQuery() {
  const [secondaryTimelineQueryRef, loadSecondaryTimelineQueryRef, dispose] =
    useQueryLoader<secondaryTimelineQuery>(SecondaryTimelineGraphqlQuery)

  return {
    secondaryTimelineQueryRef,
    loadSecondaryTimelineQueryRef,
    dispose,
  }
}

import {createStore} from './create-store'

export const sessionStorageStore = createStore('sessionStorage')

import {PageRenderer, session, setProgressBarDelay} from '@github/turbo'
import {formatKeyToError} from './utils'

interface HeadSnapshot {
  detailsByOuterHTML: {
    [outerHTML: string]: {
      tracked: boolean
      elements: Element[]
    }
  }
}

setProgressBarDelay(0)

session.isVisitable = () => true

// get the reason why a Turbo request had to be reloaded so we can report metrics
const originalTrackedElementsAreIdentical = Object.getOwnPropertyDescriptor(PageRenderer.prototype, 'reloadReason')?.get
Object.defineProperty(PageRenderer.prototype, 'reloadReason', {
  get() {
    const reloadReason = originalTrackedElementsAreIdentical?.call(this)

    if (reloadReason.reason !== 'tracked_element_mismatch') {
      return reloadReason
    }

    const currentTracked = Object.fromEntries(getSnapshotSignatures(this.currentHeadSnapshot))
    const changedKeys = []

    for (const [key, value] of getSnapshotSignatures(this.newHeadSnapshot)) {
      if (currentTracked[key] !== value) {
        changedKeys.push(formatKeyToError(key))
      }
    }

    return {
      reason: `tracked_element_mismatch-${changedKeys.join('-')}`,
    }
  },
})

function* getSnapshotSignatures(snapshot: HeadSnapshot): IterableIterator<[string, string]> {
  for (const detail of Object.values(snapshot.detailsByOuterHTML)) {
    if (detail.tracked) {
      for (const element of detail.elements) {
        if (element instanceof HTMLMetaElement && element.getAttribute('http-equiv')) {
          yield [element.getAttribute('http-equiv') || '', element.getAttribute('content') || '']
        }
      }
    }
  }
}

import {setDocumentAttributesCache} from './cache'
import {markTurboHasLoaded} from './utils'
import {beginProgressBar, completeProgressBar} from './progress-bar'
import {ssrSafeDocument} from '@github-ui/ssr-utils'
import {hasSoftNavFailure, inSoftNav, setSoftNavFailReason, setSoftNavMechanism} from '@github-ui/soft-nav/utils'
import {endSoftNav, failSoftNav, initSoftNav, renderedSoftNav, succeedSoftNav} from '@github-ui/soft-nav/state'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'

// In case this event is triggered, it means we are in a Frame navigation, so we update the mechanism (if needed).
ssrSafeDocument?.addEventListener('turbo:frame-load', event => {
  // When going to a React page, there is a chance that the soft-nav end event finishes before the frame-load event.
  // In that case, we don't want to start a new soft-nav event here, so we'll skip this if the soft-nav has already ended.
  if (inSoftNav()) setSoftNavMechanism('turbo.frame')
  // When navigating using frames, we either render here, or wait for the react-app to render.
  renderedSoftNav({skipIfGoingToReactApp: true, allowedMechanisms: ['turbo.frame']})

  if (!(event.target instanceof HTMLElement)) return

  if (event.target.getAttribute('data-turbo-action') !== 'advance') {
    // If we are not navigating to a new page, Turbo won't fire a `turbo:load` event, so we need to end the soft-nav here.
    succeedSoftNav({skipIfGoingToReactApp: true, allowedMechanisms: ['turbo.frame']})
  }
})

// Turbo navigations should end here, unless we are navigating to a React app. In that case, React itself will
// end the navigation, since Turbo doesn't know when React is done rendering.
ssrSafeDocument?.addEventListener('turbo:load', event => {
  markTurboHasLoaded()
  const isHardLoad = Object.keys(event.detail.timing ?? {}).length === 0

  if (inSoftNav() && !isHardLoad && !hasSoftNavFailure()) {
    // When navigating using drive, we either render here, or wait for the react-app to render.
    renderedSoftNav({skipIfGoingToReactApp: true, allowedMechanisms: ['turbo']})
    // If going to a react app, we let React succeed the soft-nav.
    succeedSoftNav({skipIfGoingToReactApp: true, allowedMechanisms: ['turbo', 'turbo.frame']})
  } else if (isHardLoad && (hasSoftNavFailure() || inSoftNav())) {
    // If going to a react app, we let React fail the soft-nav.
    failSoftNav({skipIfGoingToReactApp: true, allowedMechanisms: ['turbo', 'turbo.frame']})
  } else if (isHardLoad) {
    initSoftNav()
  }
})

ssrSafeDocument?.addEventListener('beforeunload', () => endSoftNav())

// Set the failure reason when we get a reload
ssrSafeDocument?.addEventListener('turbo:reload', function (event) {
  setSoftNavFailReason(event.detail.reason)
})

ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.END, setDocumentAttributesCache)

ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.PROGRESS_BAR.START, beginProgressBar)
ssrSafeDocument?.addEventListener(SOFT_NAV_STATE.PROGRESS_BAR.END, completeProgressBar)

import {IssueTracksIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {getGroupCreatedAt} from '../utils/get-group-created-at'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {SubIssueAddedEvent$key} from './__generated__/SubIssueAddedEvent.graphql'
import {IssueLink} from './IssueLink'
import {Ago} from './row/Ago'
import {TimelineRow} from './row/TimelineRow'
import styles from './SubIssueAddedEvent.module.css'

type RollupGroup = SubIssueAddedEvent$key & {source?: {__typename: string}; createdAt?: string}
type RollupGroups = Record<string, RollupGroup[]>

type SubIssueAddedEventProps = {
  queryRef: SubIssueAddedEvent$key & {createdAt?: string}
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  rollupGroup?: RollupGroups
  repositoryId: string
  ownerLogin: string
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
export const SubIssueAddedEventFragment = graphql`
  fragment SubIssueAddedEvent on SubIssueAddedEvent {
    databaseId
    actor {
      ...TimelineRowEventActor
    }
    createdAt
    subIssue {
      ...IssueLink
      databaseId
    }
  }
`

export function SubIssueAddedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  rollupGroup,
  repositoryId,
  ownerLogin,
}: SubIssueAddedEventProps) {
  const {actor, createdAt, subIssue, databaseId} = useFragment(SubIssueAddedEventFragment, queryRef)

  if (!subIssue) {
    return null
  }

  const highlighted = String(subIssue.databaseId) === highlightedEventId
  const rolledUpGroup = rollupGroup && rollupGroup['SubIssueAddedEvent'] ? rollupGroup['SubIssueAddedEvent'] : []
  const itemsToRender = rolledUpGroup.length === 0 ? [queryRef] : rolledUpGroup
  const eventCreatedAt = getGroupCreatedAt(queryRef.createdAt, rolledUpGroup)

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      showAgoTimestamp={false}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={IssueTracksIcon}
    >
      <TimelineRow.Main>
        {`${LABELS.timeline.subIssueAdded[itemsToRender.length === 1 ? 'single' : 'multiple']} `}
        {eventCreatedAt ? (
          <Ago timestamp={new Date(eventCreatedAt)} linkUrl={createIssueEventExternalUrl(issueUrl, databaseId)} />
        ) : null}
      </TimelineRow.Main>
      <TimelineRow.Secondary>
        <ul className={styles.Box}>
          {itemsToRender.map((item, index) => (
            <SubIssueEventItem
              // eslint-disable-next-line @eslint-react/no-array-index-key
              key={`${subIssue.databaseId}_${index}`}
              event={item}
              targetRepositoryId={repositoryId}
              targetOwnerLogin={ownerLogin}
            />
          ))}
        </ul>
      </TimelineRow.Secondary>
    </TimelineRow>
  )
}

function SubIssueEventItem({
  event,
  targetRepositoryId,
  targetOwnerLogin,
}: {
  event: SubIssueAddedEvent$key
  targetRepositoryId: string
  targetOwnerLogin: string
}) {
  const {subIssue} = useFragment(SubIssueAddedEventFragment, event)

  if (!subIssue) {
    return null
  }

  return (
    <li className={styles.Box_1}>
      <IssueLink data={subIssue} targetRepositoryId={targetRepositoryId} targetOwnerLogin={targetOwnerLogin} />
    </li>
  )
}

import {IssueTracksIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {getGroupCreatedAt} from '../utils/get-group-created-at'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {SubIssueRemovedEvent$key} from './__generated__/SubIssueRemovedEvent.graphql'
import {IssueLink} from './IssueLink'
import {Ago} from './row/Ago'
import {TimelineRow} from './row/TimelineRow'
import styles from './SubIssueRemovedEvent.module.css'

type RollupGroup = SubIssueRemovedEvent$key & {source?: {__typename: string}; createdAt?: string}
type RollupGroups = Record<string, RollupGroup[]>

type SubIssueRemovedEventProps = {
  queryRef: SubIssueRemovedEvent$key & {createdAt?: string}
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  rollupGroup?: RollupGroups
  repositoryId: string
  ownerLogin: string
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
const SubIssueRemovedEventFragment = graphql`
  fragment SubIssueRemovedEvent on SubIssueRemovedEvent {
    databaseId
    actor {
      ...TimelineRowEventActor
    }
    createdAt
    subIssue {
      ...IssueLink
      databaseId
    }
  }
`

export function SubIssueRemovedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  rollupGroup,
  repositoryId,
  ownerLogin,
}: SubIssueRemovedEventProps) {
  const {actor, createdAt, subIssue, databaseId} = useFragment(SubIssueRemovedEventFragment, queryRef)

  if (!subIssue) {
    return null
  }

  const highlighted = String(subIssue.databaseId) === highlightedEventId
  const rolledUpGroup = rollupGroup && rollupGroup['SubIssueRemovedEvent'] ? rollupGroup['SubIssueRemovedEvent'] : []
  const itemsToRender = rolledUpGroup.length === 0 ? [queryRef] : rolledUpGroup
  const eventCreatedAt = getGroupCreatedAt(queryRef.createdAt, rolledUpGroup)

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      showAgoTimestamp={false}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={IssueTracksIcon}
    >
      <TimelineRow.Main>
        {`${LABELS.timeline.subIssueRemoved[itemsToRender.length === 1 ? 'single' : 'multiple']} `}
        {eventCreatedAt ? (
          <Ago timestamp={new Date(eventCreatedAt)} linkUrl={createIssueEventExternalUrl(issueUrl, databaseId)} />
        ) : null}
      </TimelineRow.Main>
      <TimelineRow.Secondary>
        <ul className={styles.Box}>
          {itemsToRender.map((item, index) => (
            <SubIssueEventItem
              // eslint-disable-next-line @eslint-react/no-array-index-key
              key={`${subIssue.databaseId}_${index}`}
              event={item}
              targetRepositoryId={repositoryId}
              targetOwnerLogin={ownerLogin}
            />
          ))}
        </ul>
      </TimelineRow.Secondary>
    </TimelineRow>
  )
}

function SubIssueEventItem({
  event,
  targetRepositoryId,
  targetOwnerLogin,
}: {
  event: SubIssueRemovedEvent$key
  targetRepositoryId: string
  targetOwnerLogin: string
}) {
  const {subIssue} = useFragment(SubIssueRemovedEventFragment, event)

  if (!subIssue) {
    return null
  }

  return (
    <li className={styles.Box_1}>
      <IssueLink data={subIssue} targetRepositoryId={targetRepositoryId} targetOwnerLogin={targetOwnerLogin} />
    </li>
  )
}

import {PinIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import type {SubscribedEvent$key} from './__generated__/SubscribedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'

type SubscribedEventProps = {
  queryRef: SubscribedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function SubscribedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: SubscribedEventProps): React.ReactElement {
  const {actor, createdAt, databaseId} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment SubscribedEvent on SubscribedEvent {
        createdAt
        databaseId
        actor {
          ...TimelineRowEventActor
        }
      }
    `,
    queryRef,
  )
  const highlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={issueUrl}
      onLinkClick={onLinkClick}
      leadingIcon={PinIcon}
    >
      <TimelineRow.Main>{`${LABELS.timeline.subscribed} `}</TimelineRow.Main>
    </TimelineRow>
  )
}

import {DragAndDrop} from '@github-ui/drag-and-drop'
import {Checkbox, Spinner} from '@primer/react'
import {UnsafeHTMLDiv} from '@github-ui/safe-html/UnsafeHTML'
import type {OnConvertToIssueCallback, OnConvertToSubIssueCallback} from '@github-ui/markdown-viewer/types'
import {useCallback, useEffect, useMemo, useState} from 'react'
import type {TaskItem} from '../constants/types'
import {handleItemToggle} from '../utils/handle-item-toggle'
import styles from './TaskListItem.module.css'
import {TaskListMenu} from './TaskListMenu'

export type TaskListItemProps = {
  markdownValue: string
  onChange: (markdown: string) => void | Promise<void>
  onConvertToIssue?: OnConvertToIssueCallback
  onConvertToSubIssue?: OnConvertToSubIssueCallback
  nested?: boolean
  position?: number
  item: TaskItem
  totalItems: number
  disabled?: boolean
  hideActions?: boolean
  itemIdToFocus?: string | number | null
  setitemIdToFocus?: React.Dispatch<React.SetStateAction<string | number | null>>
  toggledItem?: string | number | null
  setToggledItem: React.Dispatch<React.SetStateAction<string | number | null>>
}

const MATH_DOM_PURIFY_CONFIG = {
  ADD_TAGS: ['math-renderer'],
  ADD_ATTR: ['style', 'data-run-id', 'data-catalyst', 'class'],
}

const ISSUES_REGEX = /\/issues\/\d*\d/

// Check if there are references mixed in with any other content by rendering the content, removing the references
// and checking if there is any left over content
const isConvertable = (content: string, isIssueConversion: boolean) => {
  const renderedContent = document.createElement('div')
  renderedContent.innerHTML = content
  const references = renderedContent.querySelectorAll('span.reference')
  // If there are 0 references, then it is just some form of text, so it is convertable
  if (references.length === 0) {
    return true
  }
  // If we are testing if this content is convertable to an issue, we return false if there are any references at all
  if (isIssueConversion) {
    return false
  }
  // If there is more than 1 reference, we can't know which reference to use in conversion, so it is not convertable
  if (references.length > 1) {
    return false
  }
  const onlyReference = references[0] as HTMLElement

  // If there is content left over after removing the reference, then it is mixed content and not convertable
  onlyReference.remove()
  if (renderedContent.innerHTML.trim() !== '') {
    return false
  }
  // We can only convert issues to sub-issues, so if the reference is not an issue, then it is not convertable
  if (!ISSUES_REGEX.test(onlyReference.innerHTML)) {
    return false
  }
  return true
}

export function TaskListItem({
  markdownValue,
  onChange,
  onConvertToIssue,
  onConvertToSubIssue,
  nested = false,
  position = 1,
  item,
  totalItems,
  disabled,
  hideActions,
  itemIdToFocus,
  setitemIdToFocus,
  toggledItem,
  setToggledItem,
}: TaskListItemProps) {
  const [checked, setChecked] = useState(item.checked)
  const [showTrigger, setShowTrigger] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  const handleOnDropFocus = (itemId: string | number) => {
    const newlyDroppedItem = document.getElementById(`task-list-menu-item-${itemId}`)
    if (newlyDroppedItem) {
      newlyDroppedItem.focus()
    }
  }

  // reset focus after toggle or drop
  useEffect(() => {
    if (itemIdToFocus && !disabled) {
      handleOnDropFocus(itemIdToFocus)
      setitemIdToFocus?.(null)
    }
  }, [itemIdToFocus, disabled, setitemIdToFocus])

  useEffect(() => {
    // Reset the checked state if the item is toggled externally
    if (toggledItem && !disabled) {
      setToggledItem(null)
    }
  }, [toggledItem, disabled, setToggledItem])

  const onToggleItem = useCallback(
    (markdown: string) => {
      setChecked(!item.checked)
      setToggledItem(item.id)

      handleItemToggle({markdownValue: markdown, markdownIndex: item.markdownIndex, onChange})
    },
    [item, onChange, setToggledItem],
  )

  const allowReordering =
    (!nested && !item.hasDifferentListTypes) ||
    (nested && position < 2 && !item.parentIsChecklist && !item.hasDifferentListTypes)

  const [canConvertToIssue, canConvertToSubIssue] = useMemo(
    () => [isConvertable(item.content, true), isConvertable(item.content, false)],
    [item.content],
  )

  const tasklistIstemTestIdBase = `tasklist-item-${position}-${item.markdownIndex}`

  let tasklistItemCssClasses =
    nested && (!onConvertToIssue || !onConvertToSubIssue)
      ? styles['no-convert-task-list-item']
      : styles['task-list-item']

  tasklistItemCssClasses += ` ${nested && totalItems > 0 ? 'contains-task-list' : ''}`
  tasklistItemCssClasses += disabled ? ` ${styles.disabled}` : ''

  return (
    <div
      className={tasklistItemCssClasses}
      onMouseEnter={() => setShowTrigger(true)}
      onMouseLeave={() => setShowTrigger(false)}
      data-testid={tasklistIstemTestIdBase}
    >
      <div className={styles['left-aligned-content']}>
        <div className={styles['drag-drop-container']}>
          {allowReordering && !disabled && (
            <DragAndDrop.DragTrigger
              className={`${styles['drag-handle-icon']} ${showTrigger ? styles['show-trigger'] : ''}`}
              style={{
                width: '20px',
                height: '28px',
              }}
            />
          )}
        </div>

        <div className={styles['checkbox-items']} id={`checkbox-item-${item.id}`}>
          <Checkbox
            autoFocus={item.id === toggledItem}
            checked={checked}
            disabled={disabled}
            onChange={e => {
              e.preventDefault()
              e.stopPropagation()
              onToggleItem(markdownValue)
            }}
            aria-label={`${item.title} checklist item`}
            className={styles.taskStatusCheckbox}
          />
          <UnsafeHTMLDiv
            html={item.content}
            className={styles['task-list-html']}
            domPurifyConfig={MATH_DOM_PURIFY_CONFIG}
          />
        </div>
      </div>
      <div className={styles.TaskListItemActionsContainer}>
        {isConverting && <Spinner size="small" />}

        {!hideActions && allowReordering && item.position && !isConverting && (
          <TaskListMenu
            data-testid={`${tasklistIstemTestIdBase}-menu`}
            onConvertToIssue={onConvertToIssue}
            onConvertToSubIssue={onConvertToSubIssue}
            totalItems={totalItems}
            item={item}
            disabled={disabled}
            allowIssueConversion={canConvertToIssue}
            allowSubIssueConversion={canConvertToSubIssue}
            setIsConverting={setIsConverting}
            allowReordering={allowReordering}
          />
        )}
      </div>
    </div>
  )
}

import {createPortal} from 'react-dom'
import {DragAndDrop, type OnDropArgs} from '@github-ui/drag-and-drop'
import React, {useCallback, useMemo, useState} from 'react'
import styles from './TaskListItems.module.css'
import {TaskListItem} from './TaskListItem'
import {ListItem} from './ListItem'
import type {TaskItem} from '../constants/types'
import {updateLocalState, updateMarkdown} from '../utils/updaters'
import type {OnConvertToIssueCallback, OnConvertToSubIssueCallback} from '@github-ui/markdown-viewer/types'

export type TaskListItemsProps = {
  tasklists: Element[]
  markdownValue: string
  tasklistData: Map<Element, TaskItem[]>
  setTasklistData: React.Dispatch<React.SetStateAction<Map<Element, TaskItem[]>>>
  onConvertToIssue?: OnConvertToIssueCallback
  onConvertToSubIssue?: OnConvertToSubIssueCallback
  externalOnChange?: (value: string) => void | Promise<void>
  nestedItems: Map<string, number | undefined>
  disabled?: boolean
  viewerCanUpdate?: boolean
}

type onDropProps = OnDropArgs<string | number> & {
  items: TaskItem[]
  container: Element
}

export const TaskListItems = ({
  tasklists,
  markdownValue,
  externalOnChange,
  onConvertToIssue,
  onConvertToSubIssue,
  tasklistData,
  setTasklistData,
  disabled,
  viewerCanUpdate,
}: TaskListItemsProps) => {
  const [isUpdating, setIsUpdating] = useState(false)
  const [itemIdToFocus, setitemIdToFocus] = useState<string | number | null>(null)
  // state to track the last toggled item, so we can focus it after an update
  // needs to be separate from the `itemIdToFocus` state above since it is eagerly
  // used to focus the menu after an item is dragged
  const [toggledItem, setToggledItem] = useState<string | number | null>(null)

  const onDrop = useCallback(
    async ({dragMetadata, dropMetadata, isBefore, items, container}: onDropProps) => {
      if (dragMetadata.id === dropMetadata?.id || disabled) return

      setIsUpdating(true)

      const dragMarkdownIndex = items.find(item => item.id === dragMetadata.id)?.markdownIndex
      const dropMarkdownIndex = items.find(item => item.id === dropMetadata.id)?.markdownIndex

      if (dragMarkdownIndex === undefined || dropMarkdownIndex === undefined) return

      const updatedMarkdown = updateMarkdown(markdownValue, isBefore, dragMarkdownIndex, dropMarkdownIndex)

      const newData = updateLocalState(items, dragMetadata.id, dropMetadata.id, tasklistData, isBefore, container)

      setTasklistData(newData)

      if (externalOnChange) {
        await externalOnChange(updatedMarkdown)
        setIsUpdating(false)
        setitemIdToFocus(dropMetadata.id)
      }
    },
    [disabled, markdownValue, tasklistData, setTasklistData, externalOnChange],
  )

  const onTasklistItemChangeHandler = useCallback(
    async (value: string) => {
      if (externalOnChange) {
        setIsUpdating(true)
        await externalOnChange(value)
        setIsUpdating(false)
      }
    },
    [externalOnChange],
  )

  const tasklistItems = useMemo(() => {
    return (
      <>
        {tasklists.map((container, i) => {
          const items = tasklistData.get(container) || []
          const checkListItems = items.filter(item => !item.isBullet && !item.isNumbered)
          const BaseListItem =
            container.tagName === 'OL'
              ? 'ol'
              : container.tagName === 'UL' &&
                  (!container.classList.contains('contains-task-list') || checkListItems.length !== items.length)
                ? 'ul'
                : 'div'

          return items.length > 0
            ? createPortal(
                <li className="base-task-list-item" style={{listStyle: 'none', marginLeft: '-28px'}}>
                  <DragAndDrop
                    items={items}
                    onDrop={args => onDrop({...args, items, container})}
                    style={{
                      marginTop: '1px',
                    }}
                    renderOverlay={(item, index) => (
                      <DragAndDrop.Item
                        index={index}
                        id={item.id}
                        key={item.id}
                        title={item.title}
                        hideTrigger
                        isDragOverlay
                      >
                        {renderNestedItems(item, 0, container, items.length, false, true)}
                      </DragAndDrop.Item>
                    )}
                    as="div"
                  >
                    <BaseListItem
                      className={'base-list-item'}
                      style={{
                        marginLeft: checkListItems.length !== items.length && checkListItems.length ? '5px' : '0px',
                      }}
                    >
                      {items.map((item, index) => {
                        return (
                          <DragAndDrop.Item
                            index={index}
                            id={item.id}
                            key={item.id}
                            title={item.title}
                            hideTrigger
                            className={
                              item.isBullet
                                ? styles['bullet-task-item']
                                : item.isNumbered
                                  ? styles['numbered-task-item']
                                  : styles['task-list-item']
                            }
                            as={showAsLi(item) ? 'li' : 'div'}
                            style={{
                              marginLeft:
                                !item.isBullet && !item.isNumbered && item.hasDifferentListTypes ? '-28px' : '0px',
                              marginRight: '-8px',
                            }}
                          >
                            {renderNestedItems(item, 0, container, items.length, false, false)}
                          </DragAndDrop.Item>
                        )
                      })}
                    </BaseListItem>
                  </DragAndDrop>
                </li>,
                container,
                // using index as key is OK here because users can't reorder tasklist, but it's still not great because
                // tasklist order _can_ change if a live update comes in with new Markdown. So we definitely want to add a
                // unique ID per tasklist as well.
                i.toString(),
              )
            : null
        })}
      </>
    )
    // We only want to re-render when the markdownValue or the tasklistData changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdownValue, tasklistData, disabled])

  function renderNestedItems(
    item: TaskItem,
    position: number,
    container: Element,
    totalItems: number,
    nested: boolean,
    isDragOverlay: boolean,
  ) {
    const isTaskListItem = !item.isBullet && !item.isNumbered
    const BaseListItem = container.tagName === 'OL' ? 'ol' : container.tagName === 'UL' ? 'ul' : 'div'
    return (
      <React.Fragment key={item.index}>
        {isTaskListItem && (
          <TaskListItem
            toggledItem={toggledItem}
            setToggledItem={setToggledItem}
            markdownValue={markdownValue}
            onChange={onTasklistItemChangeHandler}
            onConvertToIssue={onConvertToIssue}
            onConvertToSubIssue={onConvertToSubIssue}
            nested={nested}
            position={position}
            item={item}
            totalItems={totalItems}
            disabled={disabled || isUpdating}
            hideActions={!viewerCanUpdate && !isUpdating}
            setitemIdToFocus={setitemIdToFocus}
            itemIdToFocus={itemIdToFocus}
          />
        )}

        {!isTaskListItem && <ListItem item={item} position={position} />}

        {item.children.length > 0 && (
          <DragAndDrop
            items={item.children}
            onDrop={args => onDrop({...args, items: item.children, container})}
            renderOverlay={(child, index) => (
              <DragAndDrop.Item
                index={index}
                id={child.id}
                key={child.id}
                title={child.title}
                hideTrigger
                className={styles['task-list-item']}
                isDragOverlay
                style={{
                  marginLeft: '-30px',
                }}
              >
                {renderNestedItems(child, position + 1, container, item.children.length, true, true)}
              </DragAndDrop.Item>
            )}
            as={'div'}
          >
            <BaseListItem
              className={'base-list-item'}
              style={{listStyleType: 'none', marginLeft: !isTaskListItem ? '-28px' : '12px'}}
            >
              {item.children.map((child, index) => {
                const orderedUnorderedItem = getOrderedUnorderedClass({child, position})
                const nestedTaskList = getNestedClass({child, isDragOverlay})
                const taskListChild = getOverlayClass({child, isDragOverlay})

                return (
                  <DragAndDrop.Item
                    index={index}
                    id={child.id}
                    key={child.id}
                    title={child.title}
                    hideTrigger
                    className={`${orderedUnorderedItem} ${nestedTaskList} ${taskListChild}`}
                    as={showAsLi(item) ? 'li' : 'div'}
                  >
                    {renderNestedItems(child, position + 1, container, item.children.length, true, isDragOverlay)}
                  </DragAndDrop.Item>
                )
              })}
            </BaseListItem>
          </DragAndDrop>
        )}
      </React.Fragment>
    )
  }

  return tasklistItems
}

const getOrderedUnorderedClass = ({child, position}: {child: TaskItem; position: number}) => {
  return child.isNumbered
    ? position + 1 < 2
      ? styles['numbered-task-list']
      : styles['numbered-task-list-nested']
    : child.isBullet
      ? position + 1 < 2
        ? styles['unordered-task-list']
        : styles['unordered-task-list-nested']
      : styles['task-list-item']
}

const getNestedClass = ({child, isDragOverlay}: {child: TaskItem; isDragOverlay: boolean}) => {
  return (
    !child.isBullet &&
    !child.isNumbered &&
    (isDragOverlay
      ? styles['nested-overlay-list']
      : !child.parentIsChecklist && !child.hasDifferentListTypes
        ? styles['task-list-item']
        : '')
  )
}

const getOverlayClass = ({child, isDragOverlay}: {child: TaskItem; isDragOverlay: boolean}) => {
  return (child.isBullet || child.isNumbered) && (isDragOverlay ? styles['overlay-task-list-child'] : '')
}

const showAsLi = (item: TaskItem) => {
  return (
    ((item.isNumbered || item.isBullet) && !item.hasDifferentListTypes) ||
    item.hasDifferentListTypes ||
    item.children.length > 0
  )
}

export const LABELS = {
  convertToIssue: 'Convert to issue',
  convertToSubIssue: 'Convert to sub-issue',
  moveUp: 'Move up',
  moveDown: 'Move down',
  openTaskOptions: (title: string) => `Open ${title} task options`,
}

import {ActionList, ActionMenu, IconButton} from '@primer/react'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  IssueOpenedIcon,
  IssueTracksIcon,
  KebabHorizontalIcon,
} from '@primer/octicons-react'
import {LABELS} from '../constants/labels'
import {useDragAndDrop} from '@github-ui/drag-and-drop'
import {useMemo, useState} from 'react'
import type {TaskItem} from '../constants/types'
import type {OnConvertToIssueCallback, OnConvertToSubIssueCallback} from '@github-ui/markdown-viewer/types'

import styles from './TaskListMenu.module.css'

export type TaskListMenuProps = {
  onConvertToIssue?: OnConvertToIssueCallback
  onConvertToSubIssue?: OnConvertToSubIssueCallback
  totalItems: number
  item: TaskItem
  disabled?: boolean
  allowIssueConversion: boolean
  allowSubIssueConversion: boolean
  'data-testid'?: string
  setIsConverting: React.Dispatch<React.SetStateAction<boolean>>
  allowReordering?: boolean
}

type HandleMoveProps = {
  moveAction: string
  e: React.MouseEvent<HTMLLIElement> | React.KeyboardEvent<HTMLLIElement>
}

type HandleKeyDownProps = {
  e: React.KeyboardEvent<HTMLLIElement>
  move?: string
  convertToIssue?: boolean
  convertToSubIssue?: boolean
}

export const TaskListMenu = ({
  totalItems,
  onConvertToIssue,
  onConvertToSubIssue,
  item,
  allowIssueConversion,
  allowSubIssueConversion,
  disabled,
  setIsConverting,
  allowReordering,
  ...props
}: TaskListMenuProps) => {
  const {title, index, id} = item
  const {moveToPosition} = useDragAndDrop()
  const [openOverlay, setOpenOverlay] = useState(false)

  const itemId = useMemo(() => `task-list-menu-item-${id}`, [id])

  const handleFocusMenuButton = (isSubIssue: boolean) => {
    if (isSubIssue) {
      // Sub issue will be removed from the task list, so we need to focus the nearest menu button
      const allMenuButtons = Array.from(document.querySelectorAll('[id^="task-list-menu-item-"]'))
      if (allMenuButtons.length > 0) {
        const nearestButton = allMenuButtons[Math.min(index, allMenuButtons.length - 1)] as HTMLElement
        nearestButton?.focus()
      }
    } else {
      const button = document.getElementById(itemId)
      if (button) {
        button.focus()
      }
    }
  }

  const handleMove = ({moveAction, e}: HandleMoveProps) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenOverlay(false)

    switch (moveAction) {
      case 'up':
        moveToPosition(index, index - 1, true)
        break
      case 'down':
        moveToPosition(index, index + 1, false)
        break
      default:
        break
    }
  }

  const handleKeyDown = ({e, move, convertToIssue, convertToSubIssue}: HandleKeyDownProps) => {
    e.preventDefault()
    e.stopPropagation()

    const handleConvertToIssueCallback = () => {
      handleFocusMenuButton(false)
    }

    const handleConvertToSubIssueCallback = () => {
      handleFocusMenuButton(true)
    }

    if (e.code === 'Enter' && move) handleMove({moveAction: move, e})
    if (e.code === 'Enter' && convertToIssue) {
      setOpenOverlay(false)
      onConvertToIssue?.(item, setIsConverting, handleConvertToIssueCallback)
    }

    if (e.code === 'Enter' && convertToSubIssue) {
      setOpenOverlay(false)
      onConvertToSubIssue?.(item, setIsConverting, handleConvertToSubIssueCallback)
    }

    if (e.code === 'Escape') setOpenOverlay(false)
  }

  return (
    <ActionMenu open={openOverlay} onOpenChange={setOpenOverlay}>
      <ActionMenu.Anchor id={itemId}>
        <IconButton
          data-testid={props['data-testid']}
          icon={KebabHorizontalIcon}
          variant="invisible"
          aria-label={LABELS.openTaskOptions(title)}
          disabled={disabled}
          className={styles.TaskListMenuTriggerButton}
        />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay>
        <ActionList>
          {allowReordering && (
            <>
              <ActionList.Item
                onClick={e => handleMove({moveAction: 'up', e})}
                onKeyDown={e => handleKeyDown({e, move: 'up'})}
                disabled={index === 0}
              >
                <ActionList.LeadingVisual>
                  <ChevronUpIcon />
                </ActionList.LeadingVisual>
                {LABELS.moveUp}
              </ActionList.Item>
              <ActionList.Item
                onClick={e => handleMove({moveAction: 'down', e})}
                onKeyDown={e => handleKeyDown({e, move: 'down'})}
                disabled={index === totalItems - 1}
              >
                <ActionList.LeadingVisual>
                  <ChevronDownIcon />
                </ActionList.LeadingVisual>
                {LABELS.moveDown}
              </ActionList.Item>
            </>
          )}

          {allowIssueConversion && onConvertToIssue && (
            <ActionList.Item
              onClick={() => onConvertToIssue?.(item, setIsConverting)}
              onKeyDown={e => handleKeyDown({e, convertToIssue: true})}
              data-testid={props['data-testid'] && `${props['data-testid']}-convert`}
            >
              <ActionList.LeadingVisual>
                <IssueOpenedIcon />
              </ActionList.LeadingVisual>
              {LABELS.convertToIssue}
            </ActionList.Item>
          )}
          {allowSubIssueConversion && onConvertToSubIssue && (
            <ActionList.Item
              onClick={() => onConvertToSubIssue?.(item, setIsConverting)}
              onKeyDown={e => handleKeyDown({e, convertToSubIssue: true})}
              data-testid={props['data-testid'] && `${props['data-testid']}-convert-sub-issue`}
            >
              <ActionList.LeadingVisual>
                <IssueTracksIcon />
              </ActionList.LeadingVisual>
              {LABELS.convertToSubIssue}
            </ActionList.Item>
          )}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

import {createContext, use, useEffect, type PropsWithChildren} from 'react'
import {SubscriptionSet, Topic} from '@github/alive-client'

type InitialMessages = Array<[string, unknown]>

const AliveTestContext = createContext<typeof testSubscribeToAlive | null>(null)

let subscriptions: SubscriptionSet<(data: unknown) => unknown> | null = null
/**
 * Provides context required to dispatch mock alive messages via `dispatchAliveTestMessage`
 *
 *@example
 * ```ts
 * import {AliveTestProvider, dispatchAliveTestMessage, signChannel} from '@github-ui/use-alive/test-utils'
 *
 * render(<MyComponent aliveChannel={signChannel("channel-name")} />, {
 *   wrapper: ({children}) => (
 *     <AliveTestProvider
 *       initialMessages={[["channel-name", {data: 1}]]}
 *     >
 *       {children}
 *     </AliveTestProvider>
 * )})
 *
 * // later in the test, you can send another message:
 * dispatchAliveTestMessage("channel-name", {data: 2})
 * ```
 */
export function AliveTestProvider({children, initialMessages}: PropsWithChildren<{initialMessages?: InitialMessages}>) {
  useEffect(() => {
    const timeouts: number[] = []
    if (initialMessages) {
      for (const [channel, users] of initialMessages) {
        const timeout = window.setTimeout(() => {
          dispatchAliveTestMessage(channel, users)
        }, 0)

        timeouts.push(timeout)
      }
    }

    return () => {
      // delete subscriptions on unmount of provider to reset subs between tests
      subscriptions = null

      for (const timeout of timeouts) {
        window.clearTimeout(timeout)
      }
    }
  })
  return <AliveTestContext value={testSubscribeToAlive}>{children}</AliveTestContext>
}

/**
 * Send mock Alive messages for tests or storybook etc.
 * Component under test **must** be wrapped in `AliveTestProvider` to enable Alive mocking.
 *
 * @see `AliveTestProvider`
 *
 * @param channel - an unsigned alive channel name: subscribers to this channel will be notified
 * @param data - data to send to subscribers
 */
export function dispatchAliveTestMessage(channel: string, data: unknown) {
  if (subscriptions === null) {
    throw new Error(
      'Test helper `dispatchAliveTestMessage` called outside `AliveTestProvider`. Please wrap your component under test in `AliveTestProvider` from "@github-ui/use-alive/test-utils".',
    )
  }

  const subscribers = Array.from(subscriptions.subscribers(channel))
  for (const subscriber of subscribers) {
    subscriber(data)
  }
}

/**
 * Provides access to the `testSubscribeToAlive` mock if called from within a `AliveTestProvider` context
 */
export function useTestSubscribeToAlive() {
  return use(AliveTestContext)
}

/**
 * This function is private and is intended only to be consumable via `AliveTestProvider` / `useTestSubscribeToAlive`
 * Furthermore it is only expected to be used in `use-alive.ts`
 * @param signedChannel - A signed alive channel. You can use `signChannel` to generate a signed channel from a channel name.
 * @param callback - this will be called with data provided via `dispatchAliveTestMessage` to simulate an alive message
 * @private
 */
function testSubscribeToAlive(signedChannel: string, callback: (data: unknown) => unknown) {
  const topic = Topic.parse(signedChannel)
  if (!topic) {
    throw new Error(`Invalid channel name. Did you forget to sign it with \`signChannel("${signedChannel}")\`?`)
  }
  if (!subscriptions) {
    subscriptions = new SubscriptionSet()
  }
  subscriptions.add({topic, subscriber: callback})
  return {
    unsubscribe: () => {
      subscriptions?.delete({topic, subscriber: callback})
    },
  }
}

const fakeTimestamp = 1234567890
const fakeSignature = 'SIGNATURE'

/**
 * Simulate a server-signed alive channel. Useful for passing as the signed channel to `useAlive` in code under test.
 *
 * @param channel - Unsigned channel name. This is the channel you will dispatch messages to.
 * @param [timestamp=1234567890] - Unix Epoch Time the channel was signed on the server. Default is equal to
 *         "2009-02-13T23:31:30.000Z" (multiply by 1000 for JS time in milliseconds)
 * @param [signature='SIGNATURE'] - String used to verify the signature. Ignored in test mode.
 * @returns A signed channel of the form `${btoa({"c": "CHANNEL", "t": 1234567890}')}--SIGNATURE`
 */
export function signChannel(channel: string, timestamp = fakeTimestamp, signature = fakeSignature) {
  return `${btoa(`{"c": "${channel}", "t": ${timestamp}}`)}--${signature}`
}

export const TEST_IDS = {
  timelineDivider: (id: string) => `timeline-divider-${id}`,
}

import {Spinner} from '@primer/react'
import {Box} from '@primer/styled-react'

import {TEST_IDS} from '../../constants/test-ids'
import styles from './TimelineDivider.module.css'

type TimelineDividerProps = {
  isLoading?: boolean
  isHovered?: boolean
  id?: string
}

export const TimelineDivider = ({isLoading, isHovered, id}: TimelineDividerProps) => (
  <Box
    sx={{
      justifyContent: isLoading ? 'center' : 'space-between',
    }}
    data-testid={id ? TEST_IDS.timelineDivider(id) : undefined}
    className={styles.Box}
  >
    {isLoading ? (
      <Spinner size={'small'} />
    ) : (
      <>
        <div className={styles.Box_1} />
        <Box
          sx={{
            opacity: isHovered ? 1 : 0,
          }}
          className={styles.Box_2}
        />
      </>
    )}
  </Box>
)

import {useLinkInterception} from '@github-ui/use-link-interception'
import type {Icon} from '@primer/octicons-react'
import {useSlots} from '@primer/react/experimental'
import {Timeline} from '@primer/styled-react'
import {Octicon} from '@primer/styled-react/deprecated'
import {clsx} from 'clsx'
import type React from 'react'
import {useRef} from 'react'
import {graphql, useFragment} from 'react-relay'

import type {TimelineRowEventActor$data, TimelineRowEventActor$key} from './__generated__/TimelineRowEventActor.graphql'
import {Ago} from './Ago'
import {EventActor} from './EventActor'
import styles from './row.module.css'
import timelineRowStyles from './TimelineRow.module.css'

type TimelineRowType = {
  actor: TimelineRowEventActor$key | null | undefined
  highlighted: boolean
  createdAt: string
  deepLinkUrl: string
  onLinkClick?: (event: MouseEvent) => void
  showAgoTimestamp?: boolean
  showActorName?: boolean
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  children: React.ReactNode
  leadingIcon: Icon
  iconColoring?: {
    color?: string
    backgroundColor?: string
  }
  fillRow?: boolean
}

type RowInternalType = Omit<TimelineRowType, 'children' | 'actor'> & {
  slots: RowSlots
  actor: TimelineRowEventActor$key
}

type EventRowSlotsConfig = {
  trailing: typeof Trailing
  secondary: typeof Secondary
  main: typeof Main
}

type RowSlots = ReturnType<typeof useSlots<EventRowSlotsConfig>>

const Row = ({actor, children, ...props}: TimelineRowType) => {
  const slots = useSlots<EventRowSlotsConfig>(children, {
    trailing: Trailing,
    secondary: Secondary,
    main: Main,
  })

  if (actor) return <RowInternal actor={actor} slots={slots} {...props} />

  return <RowBase actorData={null} slots={slots} {...props} />
}

const RowInternal = ({actor, ...props}: RowInternalType) => {
  const actorData = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment TimelineRowEventActor on Actor {
        ...EventActor
      }
    `,
    actor,
  )

  return <RowBase {...props} actorData={actorData} />
}

type RowBaseType = Omit<TimelineRowType, 'children' | 'actor'> & {
  slots: RowSlots
  actorData?: TimelineRowEventActor$data | null
}

export const RowBase = ({
  showActorName = true,
  showAgoTimestamp = true,
  highlighted,
  createdAt,
  deepLinkUrl,
  onLinkClick,
  refAttribute,
  leadingIcon,
  iconColoring,
  slots,
  actorData,
  fillRow,
}: RowBaseType) => {
  const highlightedStyle = highlighted
    ? {
        borderRadius: '50%',
        boxShadow: `0px 0px 0px 2px var(--fgColor-accent, var(--color-accent-fg)), 0px 0px 0px 4px var(--bgColor-accent-muted, var(--color-accent-subtle))`,
      }
    : {}

  const containerRef = useRef<HTMLDivElement | null>(null)
  useLinkInterception({htmlContainerRef: containerRef, onLinkClick, openLinksInNewTab: false})

  return (
    <Timeline.Item ref={highlighted ? refAttribute : null} className={timelineRowStyles.Timeline_Item}>
      <Timeline.Badge
        sx={{
          backgroundColor: iconColoring?.backgroundColor,
          ...highlightedStyle,
        }}
      >
        {leadingIcon && (
          <Octicon
            icon={leadingIcon}
            sx={{
              color: iconColoring?.color,
            }}
            className={timelineRowStyles.Octicon}
          />
        )}
      </Timeline.Badge>
      <Timeline.Body ref={containerRef} className={clsx('TimelineBody', styles.body, fillRow && styles.fillRow)}>
        <div className={styles.timelineBodyRowContainer}>
          <div className={styles.timelineBodyContent}>
            <EventActor actor={actorData || null} showAvatarOnly={!showActorName} />
            {slots[0].main}
            {showAgoTimestamp && <Ago timestamp={new Date(createdAt)} linkUrl={deepLinkUrl} />}
          </div>
          <div className={styles.timelineBodyTrailingContent}>{slots[0].trailing}</div>
        </div>
        <div>{slots[0].secondary}</div>
      </Timeline.Body>
    </Timeline.Item>
  )
}

function Trailing(props: React.PropsWithChildren) {
  return <div data-trailing>{props.children}</div>
}

function Secondary(props: React.PropsWithChildren) {
  return <div data-secondary>{props.children}</div>
}

function Main(props: React.PropsWithChildren) {
  return <>{props.children}</>
}

export const TimelineRow = Object.assign(Row, {
  Trailing,
  Secondary,
  Main,
})

import type {BetterSystemStyleObject} from '@primer/styled-react'
import {Box} from '@primer/styled-react'
import {useMemo} from 'react'

import {VALUES} from '../../constants/values'
import {TimelineDivider} from './TimelineDivider'
import styles from './TimelineRowBorder.module.css'

export type TimelineRowBorderProps = {
  children: React.ReactNode
  addDivider: boolean
  item: {
    __id: string
  }
  isMajor?: boolean
  isHighlighted?: boolean
  sx?: BetterSystemStyleObject
  commentParams?: TimelineRowBorderCommentParams
  ref?: React.Ref<HTMLDivElement>
}

export type TimelineRowBorderCommentParams = {
  first: boolean
  last: boolean
  viewerDidAuthor?: boolean
}

const sharedStyling: BetterSystemStyleObject = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  borderRadius: 2,
  backgroundColor: 'canvas.default',
  transition: '0.2s',
}

export const TimelineRowBorder = ({ref, ...props}: TimelineRowBorderProps) => {
  const {children, addDivider, item, isMajor, isHighlighted, commentParams, sx} = props

  const highlightedStyling = useMemo(
    () =>
      isHighlighted
        ? {
            border: '1px solid',
            borderColor: 'accent.fg',
            boxShadow: `0px 0px 0px 1px var(--fgColor-accent, var(--color-accent-fg))`,
          }
        : {},
    [isHighlighted],
  )

  const majorEventStyling = useMemo(() => {
    return {
      ...sharedStyling,
      border: '1px solid',
      borderColor: commentParams?.viewerDidAuthor ? 'accent.muted' : 'border.default',
      py: 0,
      ...highlightedStyling,
      ...sx,
      paddingTop: '0px',
    }
  }, [commentParams?.viewerDidAuthor, highlightedStyling, sx])

  const defaultStyling = useMemo(() => {
    return {
      pl: '12px',
      ...sharedStyling,
      ...highlightedStyling,
      ...sx,
    }
  }, [highlightedStyling, sx])

  const dataProps = {
    [VALUES.timeline.dataTimelineEventId]: item.__id,
    'data-highlighted-event': isHighlighted,
  }
  return (
    <div className={styles.Box}>
      {addDivider && <TimelineDivider id={item.__id} />}
      <Box
        {...dataProps}
        ref={ref}
        key={item.__id}
        sx={isMajor ? majorEventStyling : defaultStyling}
        data-testid={`timeline-row-border-${item.__id}`}
      >
        {children}
      </Box>
    </div>
  )
}
TimelineRowBorder.displayName = 'TimelineRowBorder'

/**
 * @generated SignedSource<<dbb78b1321aff7f271f46d3643364533>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import type { ReaderFragment } from 'relay-runtime';
import type { FragmentRefs } from "relay-runtime";
export type TimelineRowEventActor$data = {
  readonly " $fragmentSpreads": FragmentRefs<"EventActor">;
  readonly " $fragmentType": "TimelineRowEventActor";
};
export type TimelineRowEventActor$key = {
  readonly " $data"?: TimelineRowEventActor$data;
  readonly " $fragmentSpreads": FragmentRefs<"TimelineRowEventActor">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "TimelineRowEventActor",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "EventActor"
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};

(node as any).hash = "2dc15c7f313b6ec0395f08c1257a4d96";

export default node;

import {CheckIcon, StopIcon, InfoIcon} from '@primer/octicons-react'
import {Portal, useSafeTimeout} from '@primer/react'
import React, {useEffect, type ReactNode, type ReactElement} from 'react'

export type ToastType = 'info' | 'success' | 'error'
export type ToastRole = 'alert' | 'status' | 'log'
export interface ToastProps {
  message: ReactNode
  timeToLive?: number
  icon?: React.ReactNode
  type?: ToastType
  role?: ToastRole
}

const typeClass: Record<ToastType, string> = {
  info: '',
  success: 'Toast--success',
  error: 'Toast--error',
}
const typeIcon: Record<ToastType, ReactElement> = {
  info: <InfoIcon />,
  success: <CheckIcon />,
  error: <StopIcon />,
}

// Default role for the Toast is 'log' because 'status' is not read out by some screen readers.
// Notably, NVDA will not read out popup content if the role is 'status'.
/**
 * ⚠️ Warning: Usage of this component is discouraged by the accessibility team as
 * {@link https://github.com/github/engineering/discussions/3313 toasts are a behavior identified as a high-risk pattern}
 * within GitHub.
 * {@link https://github.com/github/accessibility/issues/4414 Reasons why toasts are a high-risk pattern}.
 */
export const Toast: React.FC<ToastProps> = ({message, timeToLive, icon, type = 'info', role = 'log'}) => {
  const [isVisible, setIsVisible] = React.useState(true)
  const {safeSetTimeout} = useSafeTimeout()

  useEffect(() => {
    if (!timeToLive) return
    safeSetTimeout(() => setIsVisible(false), timeToLive - 300)
  }, [safeSetTimeout, timeToLive])

  return (
    <Portal>
      <div className="p-1 position-fixed bottom-0 left-0 tmp-mb-3 tmp-ml-3">
        <div
          className={`Toast ${typeClass[type]} ${isVisible ? 'Toast--animateIn' : 'Toast--animateOut'}`}
          id="ui-app-toast"
          data-testid={`ui-app-toast-${type}`}
          role={role}
        >
          <span className="Toast-icon">{icon || typeIcon[type]}</span>
          <span className="Toast-content">{message}</span>
        </div>
      </div>
    </Portal>
  )
}

import {useSafeTimeout} from '@primer/react'
import {createContext, type ReactNode, useCallback, use, useMemo, useState} from 'react'
import {noop} from '@github-ui/noop'
import type {ToastRole, ToastType} from './Toast'

export const TOAST_SHOW_TIME = 5000

interface ToastInfo {
  message: ReactNode
  icon?: ReactNode
  type?: ToastType
  role?: ToastRole
}

type ToastContextType = {
  /**
   * ⚠️ Warning: Usage of this hook is discouraged by the accessibility team as
   * {@link https://github.com/github/engineering/discussions/3313 toasts are a behavior identified as a high-risk pattern}
   * within GitHub.
   * {@link https://github.com/github/accessibility/issues/4414 Reasons why toasts are a high-risk pattern}.
   */
  addToast: (toast: ToastInfo) => void
  /**
   * ⚠️ Warning: Usage of this hook is discouraged by the accessibility team as
   * {@link https://github.com/github/engineering/discussions/3313 toasts are a behavior identified as a high-risk pattern}
   * within GitHub.
   * {@link https://github.com/github/accessibility/issues/4414 Reasons why toasts are a high-risk pattern}.
   */
  addPersistedToast: (toast: ToastInfo) => void
  clearPersistedToast: () => void
}
type ToastContextProviderType = {
  children: ReactNode
}

const ToastContext = createContext<ToastContextType>({
  addToast: noop,
  addPersistedToast: noop,
  clearPersistedToast: noop,
})

type InternalToastsContextType = {
  toasts: ToastInfo[]
  persistedToast: ToastInfo | null
}
export const InternalToastsContext = createContext<InternalToastsContextType>({toasts: [], persistedToast: null})

export default ToastContext

export function ToastContextProvider({children}: ToastContextProviderType) {
  const [toasts, setToasts] = useState<ToastInfo[]>([])
  const [persistedToast, setPersistedToast] = useState<ToastInfo | null>(null)
  const {safeSetTimeout} = useSafeTimeout()

  const addToast = useCallback(
    function (toast: ToastInfo) {
      setToasts([...toasts, toast])
      safeSetTimeout(() => setToasts(toasts.slice(1)), TOAST_SHOW_TIME)
    },
    [toasts, safeSetTimeout, setToasts],
  )

  const addPersistedToast = useCallback(
    function (toast: ToastInfo) {
      setPersistedToast(toast)
    },
    [setPersistedToast],
  )

  const clearPersistedToast = useCallback(
    function () {
      setPersistedToast(null)
    },
    [setPersistedToast],
  )

  const contextValue = useMemo(() => {
    return {addToast, addPersistedToast, clearPersistedToast}
  }, [addPersistedToast, addToast, clearPersistedToast])

  const internalToastsContext = useMemo(() => {
    return {toasts, persistedToast}
  }, [toasts, persistedToast])

  return (
    <ToastContext value={contextValue}>
      <InternalToastsContext value={internalToastsContext}>{children}</InternalToastsContext>
    </ToastContext>
  )
}

export function useToastContext() {
  return use(ToastContext)
}

import {use} from 'react'
import {InternalToastsContext, TOAST_SHOW_TIME} from './ToastContext'
import {Toast} from './Toast'

// Renders all toasts including the persisted toast. Likely you'll only want to include this one in a React app, in a
// place common to all pages.
/**
 * ⚠️ Warning: Usage of this component is discouraged by the accessibility team as
 * {@link https://github.com/github/engineering/discussions/3313 toasts are a behavior identified as a high-risk pattern}
 * within GitHub.
 * {@link https://github.com/github/accessibility/issues/4414 Reasons why toasts are a high-risk pattern}.
 */
export function Toasts() {
  const {toasts, persistedToast} = use(InternalToastsContext)

  return (
    <>
      {toasts.map((toastInfo, index) => (
        <Toast
          message={toastInfo.message}
          icon={toastInfo.icon}
          // eslint-disable-next-line @eslint-react/no-array-index-key
          key={index}
          timeToLive={TOAST_SHOW_TIME}
          type={toastInfo.type}
          role={toastInfo.role}
        />
      ))}
      {persistedToast && (
        <Toast
          message={persistedToast.message}
          icon={persistedToast.icon}
          type={persistedToast.type}
          role={persistedToast.role}
        />
      )}
    </>
  )
}

import {LinkExternalIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {TransferredEvent$key} from './__generated__/TransferredEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import styles from './TransferredEvent.module.css'

type TransferredEventProps = {
  queryRef: TransferredEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function TransferredEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: TransferredEventProps): React.ReactElement {
  const {actor, createdAt, fromRepository, databaseId} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment TransferredEvent on TransferredEvent {
        databaseId
        actor {
          ...TimelineRowEventActor
        }
        createdAt
        fromRepository {
          nameWithOwner
          url
        }
      }
    `,
    queryRef,
  )

  const highlighted = String(databaseId) === highlightedEventId
  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={LinkExternalIcon}
    >
      <TimelineRow.Main>
        {LABELS.timeline.transferredThis}
        <Link href={`${fromRepository?.url}`} inline className={styles.Link}>
          {fromRepository?.nameWithOwner}
        </Link>
      </TimelineRow.Main>
    </TimelineRow>
  )
}

// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
import {isTurboFrame, dispatchTurboReload, isSameRepo, currentLocation} from './utils'
import {beginProgressBar, completeProgressBar} from './progress-bar'
import {getCachedAttributes, setDocumentAttributesCache} from './cache'
import {ssrSafeWindow, ssrSafeDocument} from '@github-ui/ssr-utils'
import {inSoftNav} from '@github-ui/soft-nav/utils'
import type {FetchRequest} from '@github/turbo/dist/types/http/fetch_request'
import type {FrameElement} from '@github/turbo'
import {addValidNonce} from '@github-ui/fetch-nonce'
import {CLIENT_VERSION_HTTP_HEADER, getClientVersion} from '@github-ui/client-version'
import {updateHtmlHighContrastMode} from '@github-ui/high-contrast-cookie'
import {addRequestId} from '@github-ui/recent-request-ids'
import {reactNavigateIfPossible} from './react'
import {sendCustomMetric} from '@github-ui/stats'

const REPOS_FRAME_ID = 'repo-content-turbo-frame'

if (ssrSafeWindow) {
  // We want to make sure that links inside a `data-turbo-frame` container also have the data attribute.
  observe('[data-turbo-frame]', {
    constructor: HTMLElement,
    add(el) {
      if (el.tagName === 'A' || el.getAttribute('data-turbo-frame') === '') return

      for (const link of el.querySelectorAll('a:not([data-turbo-frame])')) {
        link.setAttribute('data-turbo-frame', el.getAttribute('data-turbo-frame') || '')
      }
    },
  })
}

ssrSafeDocument?.addEventListener('turbo:click', function (event) {
  if (!(event.target instanceof HTMLElement)) return

  if (event.detail.originalEvent?.defaultPrevented) {
    event.preventDefault()
    return
  }

  if (reactNavigateIfPossible(event)) return

  // Let Turbo Stream links proceed with normal Turbo handling
  if (event.target.hasAttribute('data-turbo-stream')) return

  if (canFrameNavigate(event)) {
    event.preventDefault()
    event.detail.originalEvent?.preventDefault()
    frameNavigate(event)
    return
  }

  // The inSoftNav() check is a defensive guard to avoid breaking navigations in edge cases:
  // 1. frameNavigate() triggers a second turbo:click (via anchor.click()) which must proceed
  // 2. Other navigation mechanisms (React, etc.) may have started a soft nav we shouldn't interrupt
  if (!inSoftNav()) {
    event.preventDefault()
  }
})

// Emulate `onbeforeunload` event handler for Turbo navigations to
// support warning a user about losing unsaved content
ssrSafeDocument?.addEventListener('turbo:before-fetch-request', function (event) {
  try {
    const unloadMessage = window.onbeforeunload?.(event)

    if (unloadMessage) {
      const navigate = confirm(unloadMessage)
      if (navigate) {
        window.onbeforeunload = null
      } else {
        event.preventDefault()
        completeProgressBar()
      }
    }
  } catch (e) {
    if (!(e instanceof Error)) throw e
    if (e.message !== 'Permission denied to access object') throw e
  }
})

ssrSafeDocument?.addEventListener('turbo:before-fetch-request', event => {
  if (event.defaultPrevented) return

  const frame = event.target as Element
  if (isTurboFrame(frame)) {
    beginProgressBar()
  }

  const ev = event as CustomEvent

  ev.detail.fetchOptions.headers[CLIENT_VERSION_HTTP_HEADER] = getClientVersion()

  // attach a Turbo specific header for visit requests so the server can track Turbo usage
  if (!ev.detail.fetchOptions.headers['Turbo-Frame']) {
    ev.detail.fetchOptions.headers['Turbo-Visit'] = 'true'
  }
})

/**
 * I think this was upstreamed entirely - we can probably delete this emitter and just listen to fetch-request-error?
 */
// TODO: turbo upstream will emit this event eventually https://github.com/hotwired/turbo/pull/640
// and we can remove the types above
const frame = ssrSafeDocument?.createElement('turbo-frame') as unknown as FrameElement
const controllerPrototype = Object.getPrototypeOf(frame.delegate)
const originalRequestErrored = controllerPrototype.requestErrored
controllerPrototype.requestErrored = function (request: FetchRequest, error: Error) {
  this.element.dispatchEvent(
    new CustomEvent('turbo:fetch-error', {
      bubbles: true,
      detail: {request, error},
    }),
  )
  return originalRequestErrored.apply(this, request, error)
}

declare global {
  interface DocumentEventMap {
    'turbo:fetch-error': CustomEvent<{request: FetchRequest; error: Error}>
  }
}

// when a frame fetch request errors due to a network error
// we reload the page to prevent hanging the progress bar indefinitely
ssrSafeDocument?.addEventListener('turbo:fetch-error', event => {
  // we don't want to reload the page due to an error on a form
  // since we might throw away the users work or submit the form again
  // other handling would be needed for this use case
  if (event.target instanceof HTMLFormElement) {
    return
  }

  const fetchRequest = event.detail.request

  window.location.href = fetchRequest.location.href
  event.preventDefault()
})

ssrSafeDocument?.addEventListener('turbo:before-fetch-response', async event => {
  const fetchResponse = event.detail.fetchResponse

  // Turbo is misbehaving when we Drive to our 404 page, so we
  // can force a reload if the response is 404 and prevent Turbo
  // from continuing.
  if (fetchResponse.statusCode === 404) {
    dispatchTurboReload(fetchResponse.statusCode.toString())
    window.location.href = fetchResponse.location.href
    event.preventDefault()
  }

  const newNonce = fetchResponse.header('X-Fetch-Nonce')
  if (newNonce) addValidNonce(newNonce)
  const requestId = fetchResponse?.header('X-Github-Request-Id')
  if (requestId) addRequestId(requestId)
  const responseHTML = await fetchResponse.responseHTML

  // we want to handle non-HTML responses (like downloads) here
  if (!responseHTML) {
    sendCustomMetric({
      name: 'TURBO_ERROR_RESPONSE_NOT_HTML',
      value: 1,
    })

    completeProgressBar()
    // Prevent Turbo from handling this as a frame navigation
    // eslint-disable-next-line github/async-preventdefault
    event.preventDefault()

    // Trigger a native download by navigating to the URL
    if (fetchResponse?.location) {
      window.location.href = fetchResponse.location.href
    }
    return
  }

  if (!newNonce) {
    const parsedHTML = new DOMParser().parseFromString(responseHTML ?? '', 'text/html')
    handleFetchNonceFromDocument(parsedHTML)
  }
})

ssrSafeDocument?.addEventListener('turbo:frame-render', event => {
  if (isTurboFrame(event.target)) {
    completeProgressBar()
  }
})

// Update <html> attributes when Turbo renders (fires for Frame navigations)
ssrSafeDocument?.addEventListener('turbo:before-render', () => {
  // Update <html> high contrast mode
  updateHtmlHighContrastMode()
  setDocumentAttributesCache()
})

// Fallback in case the Turbo response did not add X-Fetch-Nonce header. This may happen if the browser
// fails to add the Turbo header to the request for some reason.
function handleFetchNonceFromDocument(html: Document) {
  const nonce = html.querySelector<HTMLMetaElement>(
    '#pjax-head meta[name=fetch-nonce], head meta[name=fetch-nonce]',
  )?.content

  if (nonce) addValidNonce(nonce)
}

ssrSafeWindow?.addEventListener('popstate', () => {
  const currentDocument = document.documentElement
  const cachedAttributes = getCachedAttributes()

  if (!cachedAttributes) return

  for (const attr of currentDocument.attributes) {
    if (!cachedAttributes.find(cached => cached.nodeName === attr.nodeName)) {
      currentDocument.removeAttribute(attr.nodeName)
    }
  }

  for (const attr of cachedAttributes) {
    if (currentDocument.getAttribute(attr.nodeName) !== attr.nodeValue) {
      currentDocument.setAttribute(attr.nodeName, attr.nodeValue!)
    }
  }
})

function frameNavigate(event: TurboClickEvent) {
  const anchor = document.createElement('a')
  anchor.href = event.detail.url
  anchor.setAttribute('data-turbo-frame', REPOS_FRAME_ID)
  anchor.hidden = true
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

// This only works for repos for now.
function canFrameNavigate(event: TurboClickEvent) {
  if (!(event.target instanceof HTMLElement)) return false

  const frameId = event.target.getAttribute('data-turbo-frame')

  // already a frame navigation
  if (frameId) return false

  const frameElement = document.getElementById(REPOS_FRAME_ID)

  // not in a repo frame
  if (!isTurboFrame(frameElement)) return false

  const destinationUrl = new URL(event.detail.url, window.location.origin)

  // navigating to a different repo
  if (!isSameRepo(destinationUrl.pathname, currentLocation())) return false

  return true
}

import {isFeatureEnabled} from '@github-ui/feature-flags'
import type {JSFeatureFlag} from '@github-ui/feature-flags/client-feature-flags'
import type {NormalizedSequenceString} from '@github-ui/hotkey'
import {normalizeSequence} from '@github-ui/hotkey'

import jsonMetadata from './__generated__/ui-commands.json'

const {commands, services} = jsonMetadata

const serviceCommandIds = new Set(Object.keys(commands) as CommandId[])

export type ServiceId = keyof typeof services

/** Full joined command ID (in `serviceId:commandId` form). */
export type CommandId = keyof typeof commands
export const CommandId = {
  is: (str: string): str is CommandId => serviceCommandIds.has(str as CommandId),
  getServiceId: (commandId: CommandId) => commandId.split(':')[0] as ServiceId,
}

export interface CommandMetadata {
  name: string
  description: string
  defaultBinding?: string
  featureFlag?: JSFeatureFlag
}

/**
 * Get the documentation metadata for the given command. Returns `undefined` if the command is
 * disabled via feature flag.
 */
export const getCommandMetadata = (commandId: CommandId) => {
  const metadata = commands[commandId] as CommandMetadata
  return !metadata.featureFlag || isFeatureEnabled(metadata.featureFlag) ? metadata : undefined
}

/** Get the documentation metadata for the given service. */
export const getServiceMetadata = (serviceId: ServiceId) => services[serviceId]

export const getKeybinding = (commandId: CommandId): NormalizedSequenceString | undefined => {
  const metadata = getCommandMetadata(commandId)
  return metadata?.defaultBinding ? normalizeSequence(metadata.defaultBinding) : undefined
}

/** Returns a map of id to keybinding, without entries for commands that don't have keybindings. */
export const getKeybindings = (commandIds: CommandId[]) =>
  new Map(
    commandIds
      .map(id => [id, getKeybinding(id)])
      .filter((entry): entry is [CommandId, NormalizedSequenceString] => entry[1] !== undefined),
  )

import {PersonIcon} from '@primer/octicons-react'
import {Fragment} from 'react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {AssignedEvent$key} from './__generated__/AssignedEvent.graphql'
import type {UnassignedEvent$key} from './__generated__/UnassignedEvent.graphql'
import styles from './assignees.module.css'
import {AssignmentEventAssignee} from './AssignmentEventAssignee'
import {RolledupAssignedEvent} from './RolledupAssignedEvent'
import {TimelineRow} from './row/TimelineRow'

type UnassignedEventProps = {
  queryRef: UnassignedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  rollupGroup?: Record<string, Array<AssignedEvent$key | AssignedEvent$key>>
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
const UnassignedEventFragment = graphql`
  fragment UnassignedEvent on UnassignedEvent {
    databaseId
    createdAt
    actor {
      login
      ...TimelineRowEventActor
    }
    assignee {
      ...AssignmentEventAssignee @dangerously_unaliased_fixme
      ... on Actor {
        login
      }
    }
  }
`

export function UnassignedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  rollupGroup,
}: UnassignedEventProps): React.ReactElement {
  const {actor, createdAt, assignee, databaseId} = useFragment(UnassignedEventFragment, queryRef)
  const highlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={PersonIcon}
    >
      <TimelineRow.Main>
        {rollupGroup ? (
          <RolledupAssignedEvent rollupGroup={rollupGroup} />
        ) : (
          <RemovedAssigneesRendering
            queryRefs={[queryRef]}
            selfAssigned={actor?.login === assignee?.login}
            rollup={false}
          />
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

export const RemovedAssigneesRendering = ({
  queryRefs,
  selfAssigned,
  rollup,
}: {
  queryRefs: UnassignedEvent$key[]
  selfAssigned: boolean
  rollup: boolean
}) => {
  if (queryRefs.length === 0) {
    return null
  }

  return (
    <>
      {!selfAssigned && `${LABELS.timeline.unassigned} `}
      {queryRefs.map((queryRef, index) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key
        <Fragment key={index}>
          <InternalRemovedAssigneesRendering
            queryRef={queryRef}
            rollup={rollup}
            first={index === 0}
            last={index === queryRefs.length - 1}
          />
        </Fragment>
      ))}
    </>
  )
}

const InternalRemovedAssigneesRendering = ({
  queryRef,
  rollup,
  first,
  last,
}: Pick<UnassignedEventProps, 'queryRef'> & {
  rollup: boolean
  first: boolean
  last: boolean
}) => {
  const {assignee, actor} = useFragment(UnassignedEventFragment, queryRef)

  if (!assignee?.login) {
    return null
  }

  return (
    <div className={styles.assigneeEventContainer}>
      {actor?.login === assignee?.login && !rollup ? (
        LABELS.timeline.removedTheirAssignment
      ) : (
        <>
          {!first && !last && <div className={styles.assigneeMarginRight}>,</div>}
          {!first && last && <div className={styles.assigneeMarginHorizontal}>{LABELS.timeline.and}</div>}
          <AssignmentEventAssignee assigneeRef={assignee} />
        </>
      )}
    </div>
  )
}

import {TagIcon} from '@primer/octicons-react'
import {Fragment} from 'react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {LabeledEvent$key} from './__generated__/LabeledEvent.graphql'
import type {UnlabeledEvent$key} from './__generated__/UnlabeledEvent.graphql'
import {Label} from './Label'
import styles from './labels.module.css'
import {RolledupLabeledEvent} from './RolledupLabeledEvent'
import {TimelineRow} from './row/TimelineRow'

type UnlabeledEventProps = {
  queryRef: UnlabeledEvent$key
  rollupGroup?: Record<string, Array<LabeledEvent$key | UnlabeledEvent$key>>
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  timelineEventBaseUrl: string
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
const UnlabeledEventFragment = graphql`
  fragment UnlabeledEvent on UnlabeledEvent {
    databaseId
    createdAt
    actor {
      ...TimelineRowEventActor
    }
    label {
      ...LabelData
    }
  }
`

export function UnlabeledEvent({
  queryRef,
  rollupGroup,
  issueUrl,
  onLinkClick,
  timelineEventBaseUrl,
  highlightedEventId,
  refAttribute,
}: UnlabeledEventProps): React.ReactElement {
  const {actor, createdAt, databaseId} = useFragment(UnlabeledEventFragment, queryRef)
  const highlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={TagIcon}
    >
      <TimelineRow.Main>
        {rollupGroup ? (
          <RolledupLabeledEvent rollupGroup={rollupGroup} timelineEventBaseUrl={timelineEventBaseUrl} />
        ) : (
          <UnlabeledRendering queryRefs={[queryRef]} timelineEventBaseUrl={timelineEventBaseUrl} />
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

export const UnlabeledRendering = ({
  queryRefs,
  timelineEventBaseUrl,
}: Pick<UnlabeledEventProps, 'timelineEventBaseUrl'> & {queryRefs: UnlabeledEvent$key[]}) => {
  if (queryRefs.length === 0) {
    return null
  }

  return (
    <>
      {`${LABELS.timeline.removed} `}
      {queryRefs.map((queryRef, index) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key
        <Fragment key={index}>
          <InternalAddedUnlabelRendering queryRef={queryRef} timelineEventBaseUrl={timelineEventBaseUrl} />{' '}
        </Fragment>
      ))}
    </>
  )
}

const InternalAddedUnlabelRendering = ({
  queryRef,
  timelineEventBaseUrl,
}: Pick<UnlabeledEventProps, 'queryRef' | 'timelineEventBaseUrl'>) => {
  const {label} = useFragment(UnlabeledEventFragment, queryRef)
  return (
    <div className={styles.labelContainer}>
      <Label queryRef={label} timelineEventBaseUrl={timelineEventBaseUrl} />
    </div>
  )
}

import {UnlockIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {UnlockedEvent$key} from './__generated__/UnlockedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'

type UnlockedEventProps = {
  queryRef: UnlockedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function UnlockedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: UnlockedEventProps): React.ReactElement {
  const {actor, createdAt, databaseId} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment UnlockedEvent on UnlockedEvent {
        databaseId
        createdAt
        actor {
          ...TimelineRowEventActor
        }
      }
    `,
    queryRef,
  )

  const highlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={UnlockIcon}
    >
      <TimelineRow.Main>{`${LABELS.timeline.unlockedConversation} `}</TimelineRow.Main>
    </TimelineRow>
  )
}

import {DuplicateIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {UnmarkedAsDuplicateEvent$key} from './__generated__/UnmarkedAsDuplicateEvent.graphql'
import {IssueLink} from './IssueLink'
import {TimelineRow} from './row/TimelineRow'

type UnmarkedAsDuplicateEventProps = {
  queryRef: UnmarkedAsDuplicateEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  repositoryId: string
  ownerLogin: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function UnmarkedAsDuplicateEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  repositoryId,
  ownerLogin,
}: UnmarkedAsDuplicateEventProps): React.ReactElement {
  const {
    actor,
    createdAt,
    canonical,
    databaseId,
    isCanonicalOfClosedDuplicate: isCanonicalDuplicate,
  } = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment UnmarkedAsDuplicateEvent on UnmarkedAsDuplicateEvent {
        actor {
          ...TimelineRowEventActor
        }
        createdAt
        canonical {
          ... on Issue {
            ...IssueLink @dangerously_unaliased_fixme
          }
          ... on PullRequest {
            ...IssueLink @dangerously_unaliased_fixme
          }
        }
        isCanonicalOfClosedDuplicate
        databaseId
      }
    `,
    queryRef,
  )
  const highlighted = String(databaseId) === highlightedEventId

  if (!canonical) return <></>

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={DuplicateIcon}
    >
      <TimelineRow.Main>
        {isCanonicalDuplicate ? (
          <>
            unmarked{' '}
            <IssueLink inline data={canonical} targetRepositoryId={repositoryId} targetOwnerLogin={ownerLogin} /> as a
            duplicate of this issue{' '}
          </>
        ) : (
          <>
            {LABELS.timeline.unmarkedAsDuplicate}
            <>
              &nbsp;
              <IssueLink data={canonical} targetRepositoryId={repositoryId} targetOwnerLogin={ownerLogin} />{' '}
            </>
          </>
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

/**
 * @generated SignedSource<<e0f156b77b7b95dc2c6d1e8bf172db04>>
 * @relayHash 08d7312cd1d6f4f1696df8aa4f43f531
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @relayRequestID 08d7312cd1d6f4f1696df8aa4f43f531

import type { ConcreteRequest } from 'relay-runtime';
export type unmarkIssueAsDuplicateMutation$variables = {
  cannonicalId: string;
  duplicateId: string;
};
export type unmarkIssueAsDuplicateMutation$data = {
  readonly unmarkIssueAsDuplicate: {
    readonly clientMutationId: string | null | undefined;
  } | null | undefined;
};
export type unmarkIssueAsDuplicateMutation$rawResponse = {
  readonly unmarkIssueAsDuplicate: {
    readonly clientMutationId: string | null | undefined;
  } | null | undefined;
};
export type unmarkIssueAsDuplicateMutation = {
  rawResponse: unmarkIssueAsDuplicateMutation$rawResponse;
  response: unmarkIssueAsDuplicateMutation$data;
  variables: unmarkIssueAsDuplicateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cannonicalId"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "duplicateId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "fields": [
          {
            "kind": "Variable",
            "name": "canonicalId",
            "variableName": "cannonicalId"
          },
          {
            "kind": "Variable",
            "name": "duplicateId",
            "variableName": "duplicateId"
          }
        ],
        "kind": "ObjectValue",
        "name": "input"
      }
    ],
    "concreteType": "UnmarkIssueAsDuplicatePayload",
    "kind": "LinkedField",
    "name": "unmarkIssueAsDuplicate",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "clientMutationId",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "unmarkIssueAsDuplicateMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "unmarkIssueAsDuplicateMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "id": "08d7312cd1d6f4f1696df8aa4f43f531",
    "metadata": {},
    "name": "unmarkIssueAsDuplicateMutation",
    "operationKind": "mutation",
    "text": null
  }
};
})();

(node as any).hash = "5fc4fde2e881b6e6aac8dbcb074018f1";

export default node;

import {commitLocalUpdate, commitMutation, graphql} from 'react-relay'
import type {Environment} from 'relay-runtime'

import type {
  unmarkIssueAsDuplicateMutation,
  unmarkIssueAsDuplicateMutation$data,
} from './__generated__/unmarkIssueAsDuplicateMutation.graphql'

export function commitUnmarkIssueAsDuplicateMutation({
  environment,
  input: {cannonicalId, duplicateId},
  eventId,
  onError,
  onCompleted,
}: {
  environment: Environment
  input: {cannonicalId: string; duplicateId: string}
  eventId: string
  onError?: (error: Error) => void
  onCompleted?: (response: unmarkIssueAsDuplicateMutation$data) => void
}) {
  return commitMutation<unmarkIssueAsDuplicateMutation>(environment, {
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    mutation: graphql`
      mutation unmarkIssueAsDuplicateMutation($cannonicalId: ID!, $duplicateId: ID!) @raw_response_type {
        unmarkIssueAsDuplicate(input: {canonicalId: $cannonicalId, duplicateId: $duplicateId}) {
          clientMutationId
        }
      }
    `,
    variables: {cannonicalId, duplicateId},
    onError: error => onError && onError(error),
    onCompleted: response => {
      commitLocalUpdate(environment, store => {
        const event = store.get(eventId)
        event?.setValue(true, 'pendingUndo')
      })
      onCompleted?.(response)
    },
  })
}

import {PinIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {UnpinnedEvent$key} from './__generated__/UnpinnedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'

type UnpinnedEventProps = {
  queryRef: UnpinnedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function UnpinnedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: UnpinnedEventProps): React.ReactElement {
  const {actor, createdAt, databaseId} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment UnpinnedEvent on UnpinnedEvent {
        databaseId
        createdAt
        actor {
          ...TimelineRowEventActor
        }
      }
    `,
    queryRef,
  )
  const highlighted = String(databaseId) === highlightedEventId
  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={PinIcon}
    >
      <TimelineRow.Main>{`${LABELS.timeline.unpinned} `}</TimelineRow.Main>
    </TimelineRow>
  )
}

import {PinIcon} from '@primer/octicons-react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import type {UnsubscribedEvent$key} from './__generated__/UnsubscribedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'

type UnubscribedEventProps = {
  queryRef: UnsubscribedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function UnsubscribedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: UnubscribedEventProps): React.ReactElement {
  const {actor, createdAt, databaseId} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment UnsubscribedEvent on UnsubscribedEvent {
        createdAt
        databaseId
        actor {
          ...TimelineRowEventActor
        }
      }
    `,
    queryRef,
  )
  const highlighted = String(databaseId) === highlightedEventId
  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      onLinkClick={onLinkClick}
      createdAt={createdAt}
      deepLinkUrl={issueUrl}
      leadingIcon={PinIcon}
    >
      <TimelineRow.Main>{`${LABELS.timeline.unsubscribed} `}</TimelineRow.Main>
    </TimelineRow>
  )
}

import {hasInteractions} from '@github-ui/has-interactions'
// eslint-disable-next-line no-restricted-imports
import {observe} from '@github/selector-observer'
import {morph} from '@github-ui/morpheus'
import {parseHTML} from '@github-ui/parse-html'
import {preserveAnchorNodePosition} from 'scroll-anchoring'
import {sendStats} from '@github-ui/stats'
import {currentState, updateCurrentState} from '@github-ui/history'
import {getBaseFetchHeaders} from '@github-ui/fetch-headers'

const pendingRequests = new WeakMap<HTMLElement, AbortController>()
const staleRecords: {[key: string]: string} = {}

// Wrapper around `window.location.reload()` that forceably cleans out the
// `staleRecords` state associated with the entry at the top of the history
// stack before reloading.
export function reload() {
  for (const key of Object.keys(staleRecords)) {
    delete staleRecords[key]
  }
  const stateObject = currentState()
  stateObject.staleRecords = staleRecords
  updateCurrentState(stateObject)
  window.location.reload()
}

// Associates the `staleRecords` object, if it contains any entries, with the
// entry at top of the history stack.
export function registerStaleRecords() {
  if (Object.keys(staleRecords).length > 0) {
    const stateObject = currentState()
    stateObject.staleRecords = staleRecords
    updateCurrentState(stateObject)
  }
}

// Fetch and replace container with its data-url.
//
// This replacement uses conservative checks to safely replace the element.
// If a user is interacting with any element within the container, the
// replacement will be aborted.
export async function updateContent(
  el: HTMLElement,
  options: {activateScripts: boolean} = {activateScripts: false},
): Promise<string | void> {
  if (pendingRequests.get(el)) return

  const retainFocus = el.hasAttribute('data-retain-focus')
  const url = el.getAttribute('data-url')
  if (!url) throw new Error('could not get url')
  const controller = new AbortController()
  pendingRequests.set(el, controller)

  const headers: {[key: string]: string} = {
    Accept: 'text/html',
    ...getBaseFetchHeaders(),
  }

  try {
    if (!document.hidden) {
      sendStats({
        incrementKey: 'UPDATABLE_CONTENT_XHR_REQUEST_VISIBLE',
        requestUrl: window.location.href,
        referredRequestUrl: url,
      })
    } else {
      sendStats({
        incrementKey: 'UPDATABLE_CONTENT_XHR_REQUEST_INVISIBLE',
        requestUrl: window.location.href,
        referredRequestUrl: url,
      })
    }
  } catch {
    // noop
  }

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers,
    })
    if (!response.ok) return
    const data = await response.text()
    if (hasInteractions(el, retainFocus)) {
      // eslint-disable-next-line no-console
      console.warn('Failed to update content with interactions', el)
      return
    }

    if (shouldRestoreStaleData(data)) {
      staleRecords[url] = data
    } else {
      delete staleRecords[url]
    }
    replace(el, data, {retainFocus, activateScripts: options.activateScripts})
    return data
  } catch {
    // Ignore failed request.
  } finally {
    pendingRequests.delete(el)
  }
}

// Abort any in-flight replacements and replace element without any interaction checks.
export async function replaceContent(el: HTMLElement, data: string, wasStale = false): Promise<void> {
  const controller = pendingRequests.get(el)
  controller?.abort()

  const updatable = el.closest('.js-updatable-content[data-url], .js-updatable-content [data-url]')
  if (!wasStale && updatable && updatable === el) {
    if (shouldRestoreStaleData(data)) {
      staleRecords[updatable.getAttribute('data-url') || ''] = data
    } else {
      delete staleRecords[updatable?.getAttribute('data-url') || '']
    }
  }
  return replace(el, data, {retainFocus: false, activateScripts: false})
}

function replace(
  el: HTMLElement,
  data: string,
  options: {activateScripts: boolean; retainFocus: boolean},
): Promise<void> {
  return preserveAnchorNodePosition(document, () => {
    const newContent = parseHTML(document, data.trim())
    if (options.activateScripts) {
      activateScripts(newContent)
    }

    const elementToRefocus =
      options.retainFocus && el.ownerDocument && el === el.ownerDocument.activeElement
        ? newContent.querySelector('*')
        : null

    const detailsIds = Array.from(el.querySelectorAll('details[open][id]')).map(element => element.id)
    if (el.tagName === 'DETAILS' && el.id && el.hasAttribute('open')) detailsIds.push(el.id)

    // Check the elements we are about replace to see if we want to preserve the scroll position of any of them
    for (const preserveElement of el.querySelectorAll('.js-updatable-content-preserve-scroll-position')) {
      const id = preserveElement.getAttribute('data-updatable-content-scroll-position-id') || ''
      heights.set(id, preserveElement.scrollTop)
    }

    for (const id of detailsIds) {
      const details = newContent.querySelector(`#${id}`)
      if (details) details.setAttribute('open', '')
    }

    morph(el, newContent)
    if (elementToRefocus instanceof HTMLElement) {
      elementToRefocus.focus()
    }
  })
}

const heights = new Map()
observe('.js-updatable-content-preserve-scroll-position', {
  // this type is being interpreted as a value by eslint
  // eslint-disable-next-line ssr-friendly/no-dom-globals-in-module-scope
  constructor: HTMLElement,
  add(el) {
    // When element is added to the DOM, check the map for the last scroll position we have on record for it.
    const id = el.getAttribute('data-updatable-content-scroll-position-id')
    if (!id) return
    const height = heights.get(id)
    if (height == null) return

    el.scrollTop = height
  },
})

function activateScripts(newHTML: DocumentFragment) {
  // Get scripts directly accessible from the document fragment
  const directScripts = Array.from(newHTML.querySelectorAll<HTMLScriptElement>('script[src]'))
  // Get scripts inside templates
  const templateScripts = Array.from(newHTML.querySelectorAll<HTMLTemplateElement>('template')).flatMap(template =>
    Array.from(template.content.querySelectorAll<HTMLScriptElement>('script[src]')),
  )
  // Combine both
  const allScripts = [...directScripts, ...templateScripts]

  for (const script of allScripts) {
    activateScript(script)
  }
}

function activateScript(script: HTMLScriptElement) {
  const {src} = script

  if (!src) {
    // we can't load a script without a source
    return
  }

  // eslint-disable-next-line github/no-dynamic-script-tag
  const newScript = document.createElement('script')
  copyScriptAttributes(newScript, script)
  script.replaceWith(newScript)
}

function copyScriptAttributes(destinationElement: HTMLScriptElement, sourceElement: HTMLScriptElement) {
  for (const {name, value} of sourceElement.attributes) {
    destinationElement.setAttribute(name, value)
  }
}

export function shouldRestoreStaleData(data: string) {
  return !data.includes('data-nonce')
}

export const createIssueEventExternalUrl = (issueBaseUrl: string, databaseId: number | null | undefined) =>
  `${issueBaseUrl}#event-${databaseId}`

import {useEffect} from 'react'
import useIsMounted from '@github-ui/use-is-mounted'
import {getSession} from '@github-ui/alive'
import {connectAliveSubscription} from '@github-ui/alive/connect-alive-subscription'
import {useTestSubscribeToAlive} from './TestAliveSubscription'

/**
 * Subscribe to an alive channel with a signed channel name. Event data
 * will be passed to the callback.
 * @param signedChannel the signed channel name, provided from the server
 * @param callback a callback to receive events from the alive channel. This callback should be memoized to avoid unnecessary resubscribes when React re-renders.
 */
export function useAlive<T>(signedChannel: string | null | undefined, callback: (data: T) => unknown) {
  const isMounted = useIsMounted()
  const testSubscribeToAlive = useTestSubscribeToAlive()

  useEffect(() => {
    let unsubscribeFromAlive = () => {}
    let closed = false

    async function subscribeToAlive() {
      if (!signedChannel) return

      if (typeof testSubscribeToAlive === 'function') {
        const subs = await testSubscribeToAlive(signedChannel, callback as (data: unknown) => unknown)
        if (subs) {
          unsubscribeFromAlive = subs.unsubscribe
        }
        return
      }

      try {
        const aliveSession = await getSession()
        if (closed) {
          // Possible we unsubscribed before the session returned
          // this is fine, we just don't subscribe to the channel on the alive side
          return
        }
        const resp = connectAliveSubscription(aliveSession, signedChannel, callback)
        if (resp?.unsubscribe) {
          if (isMounted()) {
            unsubscribeFromAlive = resp.unsubscribe
          } else {
            resp.unsubscribe()
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
      }
    }

    subscribeToAlive()

    return () => {
      closed = true
      unsubscribeFromAlive()
    }
  }, [signedChannel, callback, isMounted, testSubscribeToAlive])
}

import {useCallback, use} from 'react'
import {sendEvent} from '@github-ui/hydro-analytics'
import {AnalyticsContext} from '@github-ui/analytics-provider/context'

export interface AnalyticsEvent {
  category: string
  action: string
  label: string
  [key: string]: unknown
}

export type SendAnalyticsEventFunction = (
  eventType: string,
  target?: string,
  payload?: {[key: string]: unknown} | AnalyticsEvent,
) => void

/**
 * Use this hook with the AnalyticsContext to send user analytics events to the data warehouse.
 * This hook will read values from the nearest AnalyticsContext.Provider, though you can override properties directly when sending an event.
 * It uses the `sendEvent` helper from `github/hydro-analytics`,
 * which enriches event context with additional information about the user, repository, and current page.
 * See: https://thehub.github.com/epd/engineering/products-and-services/internal/hydro/installation/browser-events/
 *
 * You can find a list of all included context properties in `app/helpers/octolytics_helper.rb`.
 *
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { sendAnalyticsEvent } = useAnalytics()
 *   return <Button onClick={() => sendAnalyticsEvent('file_tree.close', 'FILE_TREE_TOGGLE')}>CLOSE TREE</Button>
 * }
 * ```
 *
 */
export function useAnalytics(): {
  sendAnalyticsEvent: SendAnalyticsEventFunction
} {
  // WARNING: Do not add any hooks here that will cause rerenders on soft navs.
  const contextData = use(AnalyticsContext)

  if (!contextData) {
    throw new Error('useAnalytics must be used within an AnalyticsContext')
  }
  const {appName, category, metadata} = contextData

  return {
    sendAnalyticsEvent: useCallback(
      (eventType, target?, payload = {}) => {
        const context = {
          react: true,
          ['app_name']: appName,
          category,
          ...metadata,
        }
        sendEvent(eventType, {...context, ...payload, target})
      },
      [appName, category, metadata],
    ),
  }
}

/**
 * Use this hook with the AnalyticsContext to send user analytics events to the data warehouse.
 * This hook will read values from the nearest AnalyticsContext.Provider, though you can override properties directly when sending an event.
 * It uses the `sendEvent` helper from `github/hydro-analytics`,
 * which enriches event context with additional information about the user, repository, and current page.
 * See: https://thehub.github.com/epd/engineering/products-and-services/internal/hydro/installation/browser-events/
 *
 * You can find a list of all included context properties in `app/helpers/octolytics_helper.rb`.
 *
 *
 * @example
 * ```tsx
 * function Component() {
 *   const { sendClickAnalyticsEvent } = useClickAnalytics()
 *   return <Button onClick={() => sendClickAnalyticsEvent({category: '...', action: '...', label: '...'})}>Submit</Button>
 * }
 * ```
 *
 */
export function useClickAnalytics(): {
  sendClickAnalyticsEvent: (payload?: {[key: string]: unknown} | AnalyticsEvent) => void
} {
  const {sendAnalyticsEvent} = useAnalytics()
  return {
    sendClickAnalyticsEvent: useCallback(
      (payload = {}) => {
        sendAnalyticsEvent('analytics.click', undefined, payload)
      },
      [sendAnalyticsEvent],
    ),
  }
}

import type {DependencyList} from 'react'
import {useCallback, useLayoutEffect, useRef, useState} from 'react'

// eslint-disable-next-line no-restricted-imports
import {RenderPhase, useRenderPhase} from '@github-ui/render-phase-provider'

type ClientValueCallback<T> = (previousValue?: T) => T

/**
 * This hook allows reading browser-only values in an SSR / hydration safe manner while guaranteeing the minimum
 * number of re-renders during CSR.
 * - In CSR, this hook will resolve the `clientValueCallback` on first render.
 * - In SSR, the `serverValue` will be returned.
 * - Finally, after hydration, the `clientValueCallback` will be resolved.
 *
 * Note that between SSR and hydration, this can cause flashes of unhydrated content when server and client values
 * differ, however this hook will not result in hydration mismatch warnings and bugs.
 *
 * @see https://thehub.github.com/epd/engineering/dev-practicals/frontend/react/ssr/ssr-tools/#useclientvalue-source
 *
 * @example
 * const [origin, updateOrigin] = useClientValue(() => window.location.origin, 'github.com', [window?.location?.origin])
 *
 * @param clientValueCallback A function that returns the value to be used on the client.
 * @param serverValue A value to be used during SSR on the server.
 * @param deps A dependency array used to memoize the `clientValueCallback`.
 *         Note that if including a browser global in the array, be sure to check for it's existence
 *         (eg `window?.api?.value`) as it may not be available in SSR.
 * @returns  [
 *             `clientValue` (Either a browser-only value, or a server fallback),\n
 *             `updateValue` (A function that can be used to update the `clientValue` by re-running the `clientValueCallback`)
 *           ]
 *
 * *Credit https://www.benmvp.com/blog/handling-react-server-mismatch-error/ for inspiration*
 */
export function useClientValue<T>(
  clientValueCallback: ClientValueCallback<T>,
  serverValue: T,
  deps?: DependencyList,
): [T, () => void]
export function useClientValue<T>(
  clientValueCallback: ClientValueCallback<T>,
  serverValue?: T,
  deps?: DependencyList,
): [T | undefined, () => void]
export function useClientValue<T>(
  clientValueCallback: ClientValueCallback<T>,
  serverValue?: T,
  deps: DependencyList = [],
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedCallback = useCallback(clientValueCallback, deps)
  const renderPhase = useRenderPhase()
  const isCSRFirstRender = useRef(renderPhase === RenderPhase.ClientRender)

  const [clientValue, setClientValue] = useState<T | undefined>(() => {
    if (renderPhase === RenderPhase.ClientRender) return memoizedCallback()
    return serverValue
  })

  const updateClientValue = useCallback(() => {
    setClientValue(memoizedCallback)
  }, [memoizedCallback])

  useLayoutEffect(() => {
    // in CSR on first render we've already set the value in the `useState` above
    if (!isCSRFirstRender.current) {
      setClientValue(memoizedCallback)
    }
    isCSRFirstRender.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoizedCallback, ...deps])

  return [clientValue, updateClientValue]
}

import {useTrackingRef} from '@github-ui/use-tracking-ref'
import debounce, {type DebouncedFunc, type DebounceSettings} from 'lodash-es/debounce'
import {useEffect, useMemo} from 'react'

export interface DebounceHookChangeSettings {
  /**
   * When the parameters (ie, the wait duration or any settings) are changed or the hook
   * is unmounted, any pending trailing calls must be handled to avoid potential memory
   * leaks. This parameter controls the handling strategy. This only has effect if
   * `trailing` is `true`.
   *
   * Options are:
   *
   * - `flush` (default): Call pending calls immediately. May result in occasionally calling
   *   more often than expected. This is the safest way to avoid losing data. If the callback
   *   is async, care must be taken not to set state or perform other actions if not mounted
   *   after awaiting.
   * - `cancel`: Cancel pending calls. May result in dropping calls.
   */
  onChangeBehavior?: 'flush' | 'cancel'
}

export type UseDebounceSettings = DebounceSettings & DebounceHookChangeSettings

/**
 * Get a debounced version of the provided function. A debounced function will wait to be
 * called until `waitMs` milliseconds have passed since the last invocation. The result of
 * this hook is referentially stable with respect to `fn`, but will change if the other
 * parameters change.
 *
 * @see {@link debounce Lodash's debounce docs} for more details on available options.
 */
export const useDebounce = <Fn extends (...args: never[]) => unknown>(
  fn: Fn,
  waitMs: number,
  {leading = false, maxWait, trailing = true, onChangeBehavior = 'flush'}: UseDebounceSettings = {},
): DebouncedFunc<Fn> => {
  const fnRef = useTrackingRef(fn)

  const debouncedFn = useMemo(() => {
    // It's not enough to set `maxWait` to `undefined` in the options object - it needs to not be `in`
    // the object at all. See: https://github.com/lodash/lodash/issues/5495
    // For `leading` and `trailing` we default to the default boolean values so they are fine.
    const options = maxWait === undefined ? {leading, trailing} : {leading, trailing, maxWait}

    // eslint-disable-next-line react-hooks/refs
    return debounce((...args: Parameters<typeof fnRef.current>) => fnRef.current(...args), waitMs, options)
  }, [fnRef, waitMs, leading, maxWait, trailing])

  useEffect(
    () => () => {
      debouncedFn?.[onChangeBehavior]()
    },
    [debouncedFn, onChangeBehavior],
  )

  return debouncedFn
}

import type {NormalizedSequenceString} from '@github-ui/hotkey'
import {useEffect, useMemo} from 'react'

import {CommandEventHandlersMap} from './command-event'
import type {CommandId} from './commands'
import {getKeybindings} from './commands'
import {filterOnce} from './utils'

/**
 * Mutable map of registered commands. Keys are the resolved keybindings, while the values are arrays of all
 * existing registered command IDs with that keybinding. Since the same command could potentially be accidentally
 * registered twice, the value is an array rather than a set.
 */
type CommandRegistry = Map<NormalizedSequenceString, readonly CommandId[]>

const registeredGlobalCommands: CommandRegistry = new Map()

export function useDetectConflicts(scope: 'global' | 'scoped', commands: CommandEventHandlersMap) {
  const registeredScopedCommands = useMemo<CommandRegistry>(() => new Map(), [])

  const registeredCommands = scope === 'global' ? registeredGlobalCommands : registeredScopedCommands

  /** Add commands to the global registry and log a warning if there is a conflict. */
  useEffect(() => {
    for (const [commandId, keybinding] of getKeybindings(CommandEventHandlersMap.keys(commands))) {
      const alreadyRegisteredIds = registeredCommands.get(keybinding)?.filter(id => id !== commandId) ?? []

      if (alreadyRegisteredIds.length)
        // eslint-disable-next-line no-console
        console.warn(
          `The keybinding (${keybinding}) for the "${commandId}" command conflicts with the keybinding for the already-registered command(s) "${alreadyRegisteredIds.join(
            ', ',
          )}". This may result in unpredictable behavior.`,
        )

      registeredCommands.set(keybinding, alreadyRegisteredIds.concat(commandId))
    }

    return () => {
      for (const [commandId, keybinding] of getKeybindings(CommandEventHandlersMap.keys(commands))) {
        // If it was registered multiple times, be careful only to remove one so we can accurately keep warning
        const remainingCommandIds = filterOnce(registeredCommands.get(keybinding) ?? [], commandId)

        if (remainingCommandIds?.length) registeredCommands.set(keybinding, remainingCommandIds)
        else registeredCommands.delete(keybinding)
      }
    }
  }, [commands, registeredCommands])
}

import {useClientValue} from '@github-ui/use-client-value'
import {type RefObject, useCallback, useEffect, useLayoutEffect, useState} from 'react'

type UseDynamicTextareaHeightSettings = {
  disabled?: boolean
  minHeightLines?: number
  maxHeightLines?: number
  elementRef: RefObject<HTMLTextAreaElement | null>
  /** The current value of the input. */
  value: string
}

/**
 * Calculates the optimal height of the textarea according to its content, automatically
 * resizing it as the user types. If the user manually resizes the textarea, their setting
 * will be respected.
 *
 * Returns an object to spread to the component's `style` prop. If you are using `Textarea`,
 * apply this to the child `textarea` element: `<Textarea style={{resultOfThisHook}} />`.
 *
 * NOTE: for the most accurate results, be sure that the `lineHeight` of the element is
 * explicitly set in CSS.
 */
export const useDynamicTextareaHeight = ({
  disabled,
  minHeightLines,
  maxHeightLines,
  elementRef,
  value,
}: UseDynamicTextareaHeightSettings): {
  height: string | undefined
  minHeight: string | undefined
  maxHeight: string | undefined
  boxSizing: 'content-box'
  fieldSizing: 'content'
  overflowWrap: 'anywhere'
} => {
  const [height, setHeight] = useState<string | undefined>(undefined)
  const [supportsFieldSizingContent] = useClientValue(() => CSS.supports('field-sizing', 'content'), true)

  const refreshHeight = useCallback(() => {
    if (disabled) return

    const element = elementRef.current
    if (!element) return

    // If the browser supports `field-sizing: content`, we can use that to avoid calculating the height ourselves.
    // This is a CSS property that allows the browser to automatically size the field based on its content.
    if (supportsFieldSizingContent) return

    // If the value is empty, we don't need to calculate a dynamic height
    if (!value) return

    const computedStyles = getComputedStyle(element)
    // Using CSS calculations is fast and prevents us from having to parse anything
    setHeight(`calc(${element.scrollHeight}px - ${computedStyles.paddingTop} - ${computedStyles.paddingBottom})`)
  }, [disabled, elementRef, supportsFieldSizingContent, value])

  useLayoutEffect(refreshHeight, [refreshHeight])

  // With Slots, initial render of the component is delayed and so the initial layout effect can occur
  // before the target element has actually been calculated in the DOM. But if we only use regular effects,
  // there will be a visible flash on initial render when not using slots

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(refreshHeight, [])

  return {
    height,
    minHeight: minHeightLines ? `${minHeightLines}lh` : undefined,
    maxHeight: maxHeightLines ? `${maxHeightLines}lh` : undefined,
    boxSizing: 'content-box',
    fieldSizing: 'content',
    // `overflow-wrap: anywhere` should be the default behavior for textareas, but `field-sizing: content` appears to
    // break that expectation. To ensure that long words still break instead of expanding the textarea horizontally,
    // we must set this explicitly.
    overflowWrap: 'anywhere',
  }
}

import {useEffect, useState, type RefObject} from 'react'

export function useFileTreeTooltip({
  focusRowRef,
  mouseRowRef,
}: {
  focusRowRef: RefObject<HTMLElement | null>
  mouseRowRef: RefObject<HTMLElement | null>
}) {
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    const focusEl = focusRowRef.current
    const mouseEl = mouseRowRef.current

    if (!focusEl || !mouseEl) return

    const showIfOverflowing = () => {
      const contentRef: HTMLElement | null = focusEl.querySelector('.PRIVATE_TreeView-item-content-text')
      if (contentRef?.scrollWidth !== contentRef?.offsetWidth) {
        setShowTooltip(true)
      }
    }

    const handleFocus = () => showIfOverflowing()
    const handleBlur = () => setShowTooltip(false)
    const handleMouseEnter = () => showIfOverflowing()
    const handleMouseLeave = () => setShowTooltip(false)

    focusEl.addEventListener('focus', handleFocus)
    focusEl.addEventListener('blur', handleBlur)
    mouseEl.addEventListener('mouseenter', handleMouseEnter)
    mouseEl.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      focusEl.removeEventListener('focus', handleFocus)
      focusEl.removeEventListener('blur', handleBlur)
      mouseEl.removeEventListener('mouseenter', handleMouseEnter)
      mouseEl.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [focusRowRef, mouseRowRef])

  return showTooltip
}

import {useEffect} from 'react'

export function useHideFooter(hide: boolean) {
  useEffect(() => {
    if (!hide) {
      return
    }

    const footer: HTMLDivElement | null = document.querySelector('.footer')
    if (!footer) {
      return
    }
    footer.hidden = true
    return () => {
      footer.hidden = false
    }
  }, [hide])
}

import {isMacOS} from '@github-ui/get-os'
import {type CompositionEventHandler, type KeyboardEventHandler, useCallback, useMemo, useRef} from 'react'

const ignoredKeysLowercase = new Set(['enter', 'tab'])

/**
 * If the user is composing text, we don't want to respond to
 * the `Enter` key to perform a typical activation
 *
 * Composing text is a special case where the user is inputting
 * text from IME (e.g. Japanese) and we don't want to save the
 * item upon receiving the enter key as that may be part of the
 * selection of the character into the input.
 *
 * issue: https://github.com/github/memex/issues/5680
 * related: https://github.com/github/memex/issues/5680
 * related: https://github.com/facebook/react/issues/3926
 *
 * @param onKeyDown: A keyboard handler callback to wrap with a callback which ignores `ENTER`
 * and `TAB` while composing.
 *
 * @returns props which should be spread onto an `<input>` element
 **/
export const useIgnoreKeyboardActionsWhileComposing = (
  onKeyDown: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement>,
) => {
  const isComposingRef = useRef(false)

  const handleComposition: CompositionEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement> =
    useCallback(event => {
      if (event.type === 'compositionstart') {
        isComposingRef.current = true
      }
      if (event.type === 'compositionend') {
        isComposingRef.current = false
      }
    }, [])

  const wrappedOnKeyDown: KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement> = useCallback(
    event => {
      // Cross-browser check for IME composition state
      const nativeEvent = event.nativeEvent
      const isComposingNative = nativeEvent && 'isComposing' in nativeEvent && nativeEvent.isComposing

      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      const isSafariProcessKey = event.key === 'Process'
      const isSafariIme229 = isMacOS() && event.keyCode === 229

      /*
       * Safari is known to fire the a unprintable keydown event of 229
       * after the `compositionend` event.
       * This is a workaround to prevent the keydown event from firing and causing
       * the input to be saved.
       *
       * Related: https://bugs.webkit.org/show_bug.cgi?id=165004
       * Related: https://www.stum.de/2016/06/24/handling-ime-events-in-javascript/
       */
      // Ignore Safari's phantom 229 keydown entirely
      if (isSafariIme229) return

      const isComposingInput = isComposingRef.current || isComposingNative || isSafariProcessKey

      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (ignoredKeysLowercase.has(event.key.toLowerCase()) && isComposingInput) {
        return
      }

      onKeyDown(event)
    },
    [onKeyDown],
  )

  const inputProps = useMemo(() => {
    return {
      onCompositionStart: handleComposition,
      onCompositionEnd: handleComposition,
      onKeyDown: wrappedOnKeyDown,
    }
  }, [handleComposition, wrappedOnKeyDown])

  return inputProps
}

import {useCallback, useEffect, useEffectEvent, useState} from 'react'

/**
 * Observe a single element with an IntersectionObserver.
 *
 * Returns a callback ref that should be attached to the target element.
 * When the element mounts, unmounts, or is swapped, the observer is
 * automatically re-created / cleaned up.
 *
 * @param callback      Called when the intersection observer fires
 * @param options       IntersectionObserver options (root, rootMargin, threshold)
 */
export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit,
): (node: Element | null) => void {
  const callbackRef = useEffectEvent(callback)
  const [element, setElement] = useState<Element | null>(null)

  const ref = useCallback((node: Element | null) => {
    setElement(node)
  }, [])

  useEffect(() => {
    if (!element) return

    const observer = new IntersectionObserver(entries => callbackRef(entries), options)
    observer.observe(element)
    return () => observer.disconnect()
  }, [element, options])

  return ref
}

import {useCallback, useLayoutEffect, useRef} from 'react'

/**
 * Hook for determining whether a component is still mounted.
 *
 * Use this to guard side-effects of asynchronous operations (fetches,
 * promises) that may complete after a component has been unmounted.
 *
 * Example:
 *
 *      const isMounted = useIsMounted();
 *      const [value, setHidden] = useHidden(true);
 *
 *      setTimeout(() => {
 *          if (isMounted()) {
 *              setHidden(true);
 *          }
 *      }, 1000);
 *
 */
export default function useIsMounted() {
  const mountedRef = useRef(false)
  const isMounted = useCallback(() => mountedRef.current, [])

  useLayoutEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
    }
  }, [])

  return isMounted
}

import {useCallback, useSyncExternalStore} from 'react'

export type Platform = 'windows' | 'mac'

function getPlatform(): Platform | null {
  if (typeof navigator === 'undefined') {
    return null
  } else if (/Windows/.test(navigator.userAgent)) {
    return 'windows'
  } else if (/Macintosh/.test(navigator.userAgent)) {
    return 'mac'
  }
  return null
}

// Platform never changes during runtime, so no-op subscribe
function subscribe() {
  return () => {}
}

// Server always returns false
function getServerSnapshot() {
  return false
}

/**
 * SSR-friendly hook to retrieve information about the user platform.
 *
 * @param platforms @type {Array<Platform>} platforms to check
 * @returns {boolean} true if user platform matches one of the provided platforms.
 */
export function useIsPlatform(platforms: Platform[]): boolean {
  return useSyncExternalStore(
    subscribe,
    useCallback(() => {
      const platform = getPlatform()
      return platform !== null && platforms.includes(platform)
    }, [platforms]),
    getServerSnapshot,
  )
}

import {useSyncExternalStore} from 'react'

// Safari has issues with position sticky, so expose a hook to check if we are in Safari
export function useIsSafari() {
  return useSyncExternalStore(subscribe, isSafariInBrowser, isSafariOnServer)
}
function isSafariInBrowser() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
}

function isSafariOnServer() {
  return false
}

//this is just a no-op, it has to be verbose because otherwise the linter is not happy
function subscribe() {
  return () => {
    return
  }
}

import type {RefObject} from 'react'
import {useCallback, useEffect, useLayoutEffect, useRef} from 'react'

import {isEditableElement} from '@github-ui/hotkey/keyboard-shortcuts-helper'

type OnKeyPressCallBack = (event: KeyboardEvent) => void

export const ModifierKeys = {
  ctrlKey: 'ctrlKey',
  altKey: 'altKey',
  shiftKey: 'shiftKey',
  metaKey: 'metaKey',
} as const

export type ModifierKeys = (typeof ModifierKeys)[keyof typeof ModifierKeys]

export type OnKeyPressOptions = {[key in ModifierKeys]?: boolean} & {
  triggerWhenInputElementHasFocus?: boolean
  triggerWhenPortalIsActive?: boolean
  scopeRef?: RefObject<HTMLElement | null>
  ignoreModifierKeys?: boolean
}

export const useKeyPress = (keys: string[], callback: OnKeyPressCallBack, options?: OnKeyPressOptions) => {
  // implement the callback ref pattern
  const callbackRef = useRef(callback)
  useLayoutEffect(() => {
    callbackRef.current = callback
  })

  // handle what happens on key press
  const handleKeyPress: EventListener = useCallback(
    (event: Event) => {
      const keyboardEvent = event as KeyboardEvent

      if (isPortalActive() && !options?.triggerWhenPortalIsActive) {
        return
      }

      if (!checkModifierKeys(keyboardEvent, options) && !options?.ignoreModifierKeys) {
        return
      }

      if (!options?.triggerWhenInputElementHasFocus && isEditableElement(event.target)) {
        return
      }

      // check if the key is part of the ones we want to listen to
      if (
        keys.some(key => {
          // In these cases we look at event.code since event.key will depend on whether a modifier key is pressed
          if (/^\d$/.test(key)) {
            return keyboardEvent.code === `Digit${key}`
          } else if (key === '/') {
            return keyboardEvent.code === 'Slash'
          }

          return keyboardEvent.key === key
        })
      ) {
        callbackRef.current(keyboardEvent)
      }
    },
    [keys, options],
  )

  useEffect(() => {
    const targetElement = options?.scopeRef?.current || document
    targetElement.addEventListener('keydown', handleKeyPress)
    return () => targetElement.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress, options?.scopeRef])
}

const portalSelectors = '#__primerPortalRoot__, [id$="-portal-root"]'

function isPortalActive() {
  const portals = [...document.querySelectorAll(portalSelectors)]
  return portals.some(elementHasNonZeroHeight)
}

function elementHasNonZeroHeight(element: Element): boolean {
  if (element.clientHeight > 0) return true

  for (const child of element.children) {
    if (elementHasNonZeroHeight(child)) return true
  }

  return false
}

function checkModifierKeys(keyboardEvent: KeyboardEvent, options: OnKeyPressOptions | undefined) {
  for (const key of Object.values(ModifierKeys)) {
    if (options && options[key] && !keyboardEvent[key]) {
      // modifier key is required but not pressed
      return false
    }

    if (keyboardEvent[key] && (!options || !options[key])) {
      // modifier key is pressed but not required
      return false
    }
  }

  return true
}

import memoize from '@github/memoize'
import {repositoryTreePath} from '@github-ui/paths'
import type {CommitWithStatus} from '@github-ui/repos-types'
import {SOFT_NAV_STATE} from '@github-ui/soft-nav/states'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {useEffect, useState} from 'react'

async function fetchJSON(url: string): Promise<CommitWithStatus | undefined> {
  const response = await verifiedFetchJSON(url)
  if (response.ok) {
    return await response.json()
  } else {
    return undefined
  }
}

const memoizeCache = new Map()
const memoizeFetchJSON = memoize(fetchJSON, {cache: memoizeCache})

export function resetMemoizeFetchJSON() {
  memoizeCache.clear()
}

/**
 * Retrieve information of latest commit of current blob or ref and path
 * If we have a current blob payload and it has latest commit, it will be returned immediately
 * Otherwise, we will fetch the latest commit from the server with the ref and path
 * Tree commits are always fetched from the server using the ref and path
 *
 * returns an array with latest commit, loading state and error
 * while loading returns [undefined, true, false]
 * if cannot retrieve latest commit, returns [undefined, false, true]
 */
export function useLatestCommit(
  repoOwner: string | undefined,
  repoName: string | undefined,
  commitish: string | undefined,
  path: string | undefined,
): [CommitWithStatus | undefined, boolean, boolean] {
  const [latestCommit, setLatestCommit] = useState<CommitWithStatus>()
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const commitInfoPath =
    repoName && repoOwner && commitish && path
      ? repositoryTreePath({
          repo: {name: repoName, ownerLogin: repoOwner},
          commitish,
          action: 'latest-commit',
          path,
        })
      : null

  // Adding a hook-specific reset call solution to reset memoize cache
  // We accept the cost of resetting the cache once per hook instance, as the cost of resetting the cache is cheap
  // If we implement Relay, it replaces this solution
  useEffect(() => {
    const abortController = new AbortController()
    document.addEventListener(SOFT_NAV_STATE.START, resetMemoizeFetchJSON, {signal: abortController.signal})

    return () => {
      abortController.abort()
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const update = async () => {
      if (!commitInfoPath) return

      setError(false)
      setLoading(true)
      setLatestCommit(undefined)
      const commit = await memoizeFetchJSON(commitInfoPath)

      if (cancelled) {
        return
      }

      try {
        if (commit) {
          setLatestCommit(commit)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      }
      setLoading(false)
    }

    update()

    return function cancel() {
      cancelled = true
    }
  }, [commitInfoPath, commitish])

  return [latestCommit, loading, error]
}

import {useEffect} from 'react'

type UseLinkInterceptionSettings = {
  // Either a ref to the container or the container itself
  // This is needed because the container may not be rendered yet when this hook is called
  htmlContainerRef?: React.RefObject<HTMLElement | null>
  htmlContainer?: HTMLElement
  onLinkClick?: (event: MouseEvent) => void
  openLinksInNewTab: boolean
}

/**
 * Updates all links in the container to open a new tab and call `onLinkClick` on click.
 */
export const useLinkInterception = ({
  htmlContainerRef,
  htmlContainer,
  onLinkClick,
  openLinksInNewTab,
}: UseLinkInterceptionSettings) => {
  useEffect(() => {
    const theref = htmlContainerRef?.current || htmlContainer

    if (!theref) return

    const clickHandler = (event: MouseEvent) => {
      const link = (event.target as Element).closest('a')
      if (!link) return

      onLinkClick?.(event)

      if (!event.defaultPrevented && openLinksInNewTab && link.href) {
        window.open(link.href, '_blank', 'noopener noreferrer')
        event.preventDefault()
      }
    }

    theref.addEventListener('click', clickHandler)

    return () => {
      theref?.removeEventListener('click', clickHandler)
    }
  }, [htmlContainer, htmlContainerRef, onLinkClick, openLinksInNewTab])
}

import {useCallback, useEffect, useRef, useSyncExternalStore} from 'react'
import {localStorageStore} from './local-storage-store'
import type {Listener} from './create-store'

const {
  cache,
  readStorage,
  writeStorage,
  resetStorage,
  subscribe,
  clearKeys,
  clearAll: clearAllLocalStorage,
} = localStorageStore

/**
 * Clears all store-tracked localStorage keys, their in-memory cache,
 * and the underlying browser localStorage.
 */
export function clearAllLocalStorageCache(): void {
  clearAllLocalStorage()
  if (typeof window !== 'undefined') {
    window.localStorage.clear()
  }
}

/**
 * Clears specified keys from localStorage and notifies subscribers
 */
export function clearLocalStorage(keys: string[]): void {
  clearKeys(keys)
}

/**
 * React hook for localStorage with cross-component synchronization.
 * Returns [value, setValue, reset] tuple.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Use ref for initialValue so it's available in callbacks without stale closure issues
  const initialValueRef = useRef(initialValue)
  useEffect(() => {
    initialValueRef.current = initialValue
  })

  // Seed lazily inside getSnapshot (idempotent) instead of during render
  // to avoid mutating external state in the render phase (concurrent-safe).
  // Uses initialValue directly (not ref) because getSnapshot runs during render
  // before the effect that updates initialValueRef.
  const getSnapshot = useCallback((): T => {
    if (!cache.has(key)) {
      readStorage(key, initialValue)
    }
    return cache.get(key) as T
  }, [key, initialValue])

  const getServerSnapshot = useCallback((): T => {
    return initialValue
  }, [initialValue])

  const subscribeToStore = useCallback((listener: Listener) => subscribe(key, listener), [key])

  const value = useSyncExternalStore(subscribeToStore, getSnapshot, getServerSnapshot)

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = cache.has(key) ? (cache.get(key) as T) : initialValueRef.current
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(current) : next
      // Treat undefined as a reset to avoid writing "undefined" string to storage
      if (resolved === undefined) {
        resetStorage(key, initialValueRef.current)
      } else {
        writeStorage(key, resolved)
      }
    },
    [key],
  )

  const reset = useCallback(() => {
    resetStorage(key, initialValueRef.current)
  }, [key])

  return [value, setValue, reset] as const
}

import {sendCustomMetric, type CustomMetricKey} from '@github-ui/stats'
import {useEffect} from 'react'

// Available in newer browsers, but TypeScript doesn't support in our lib version
interface PerformanceMemory {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

export interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory
}

/**
 * Gets current JavaScript heap memory usage in megabytes.
 * Only available in Chromium-based browsers.
 */
export function getMemoryMB(): number | null {
  const memory = (performance as PerformanceWithMemory).memory
  if (memory?.usedJSHeapSize) {
    return Math.round((memory.usedJSHeapSize / 1024 / 1024) * 10) / 10
  }
  return null
}

/**
 * Gets heap utilization as a percentage (0-100).
 */
export function getHeapUtilization(): number | null {
  const memory = (performance as PerformanceWithMemory).memory
  if (memory?.usedJSHeapSize && memory?.jsHeapSizeLimit) {
    // Calculate percentage with 2 decimal places: multiply by 100 for %, then by 100 for precision, then divide by 100 after rounding
    return Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 10000) / 100
  }
  return null
}

/**
 * Gets raw heap size in bytes (for tracking growth/max).
 */
export function getHeapSizeBytes(): number | null {
  const memory = (performance as PerformanceWithMemory).memory
  return memory?.usedJSHeapSize ?? null
}

function sendMemoryStats({statName, tags}: {statName: CustomMetricKey; tags?: PlatformBrowserCustomMetricTags}) {
  // eslint-disable-next-line compat/compat
  requestIdleCallback(() => {
    const memory = getMemoryMB()

    if (!memory) return

    sendCustomMetric({
      name: statName,
      value: memory,
      tags,
    })
  })
}

export function useMemoryStats({
  intervalMs = 5000,
  maxDatapoints = 20,
  statName,
  tags,
}: {
  intervalMs?: number
  maxDatapoints?: number
  statName: CustomMetricKey
  tags?: PlatformBrowserCustomMetricTags
}) {
  useEffect(() => {
    // This API is not available in all browsers
    if (!performance || !('memory' in performance)) return

    // Validate maxDatapoints
    if (maxDatapoints <= 0) return

    let datapointsSent = 0
    let intervalId: ReturnType<typeof setInterval> | undefined

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopReporting()
      }
    }

    const stopReporting = () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId)
        intervalId = undefined
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }

    const sendStats = () => {
      sendMemoryStats({statName, tags})
      datapointsSent++

      if (datapointsSent >= maxDatapoints) {
        stopReporting()
      }
    }

    // Send initial stat
    sendStats()

    // Only set up interval if we haven't reached max
    if (datapointsSent < maxDatapoints) {
      intervalId = setInterval(sendStats, intervalMs)
    }

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopReporting()
    }
  }, [intervalMs, maxDatapoints, statName, tags])
}

import {useTheme} from '@primer/styled-react'
import {useCallback} from 'react'

export const colorNames = ['GRAY', 'BLUE', 'GREEN', 'YELLOW', 'ORANGE', 'RED', 'PINK', 'PURPLE'] as const

export type ColorName = (typeof colorNames)[number]

const colorNamesToRoles: Record<Exclude<ColorName, 'GRAY'>, string> = {
  BLUE: 'accent',
  GREEN: 'success',
  YELLOW: 'attention',
  ORANGE: 'severe',
  RED: 'danger',
  PINK: 'sponsors',
  PURPLE: 'done',
}

export interface ColorSet {
  /** For canvas backgrounds. */
  bg?: string
  /** For text, whether on the `bg` color or on default `canvas` colors. */
  fg?: string
  /** For borders around the `bg` color. */
  border?: string
  /** For icons and standalone visuals where `fg` is too dark. */
  accent?: string
}

/** Use theme colors by presentational (rather than semantic) names. */
export const useNamedColor = (name: ColorName = 'GRAY'): ColorSet => {
  const {getPresentationalColor} = useGetPresentationalColor()
  return getPresentationalColor(name)
}

export const useGetPresentationalColor = () => {
  const {theme, resolvedColorScheme = 'light'} = useTheme()
  const getPresentationalColor = useCallback(
    (name: ColorName = 'GRAY'): ColorSet => {
      const scheme = ignoreColorblindSchemes(resolvedColorScheme)
      const colors = theme?.colorSchemes?.[scheme]?.colors

      if (name === 'GRAY') {
        return {
          bg: colors?.canvas?.subtle,
          fg: colors?.fg?.muted,
          border: colors?.border?.default,
          accent: colors?.fg?.subtle,
        }
      } else {
        const base = colors?.[colorNamesToRoles[name]]
        return {bg: base?.subtle, fg: base?.fg, border: base?.muted, accent: base?.emphasis}
      }
    },
    [theme, resolvedColorScheme],
  )
  return {getPresentationalColor}
}

/** Helper to validate if a string is an acceptable color name (case sensitive). */
export const isColorName = (str: string): str is ColorName => (colorNames as readonly string[]).includes(str)

/**
 * Colorblind schemes mutate the color scale, ie by making the success color blue instead
 * of green. They even mutate the Primer 'scale' colors, so `green.5` becomes blue. So
 * we have to just ignore them. See: https://github.com/github/primer/issues/1679
 */
const ignoreColorblindSchemes = (scheme: string) =>
  scheme === 'light_colorblind' || scheme === 'light_tritanopia'
    ? 'light'
    : scheme === 'dark_colorblind' || scheme === 'dark_tritanopia'
      ? 'dark'
      : scheme

import type {NormalizedSequenceString} from '@github-ui/hotkey'
import {eventToHotkeyString, SequenceTracker} from '@github-ui/hotkey'
import {isShortcutAllowed} from '@github-ui/hotkey/keyboard-shortcuts-helper'
import {useCallback, useMemo, useRef} from 'react'

import type {CommandId} from './commands'
import {getKeybinding} from './commands'

interface UseOnKeyDownOptions {
  triggerOnDefaultPrevented?: boolean
}

/**
 * @param triggerCommand Callback to trigger the command handler. Explicitly return `false` to indicate that the
 * command was ignored and the event should be allowed to propagate as normal.
 */
export function useOnKeyDown(
  commandsIds: CommandId[],
  triggerCommand: (id: CommandId, event: KeyboardEvent) => false | void,
  {triggerOnDefaultPrevented = false}: UseOnKeyDownOptions = {},
) {
  const sequenceTracker = useMemo(() => new SequenceTracker(), [])

  /** Map of keybinding string to command ID for fast lookup. */
  const keybindingMap = useMemo(() => {
    const map = new Map<NormalizedSequenceString, CommandId>()

    for (const id of commandsIds) {
      const keybinding = getKeybinding(id)
      if (keybinding) map.set(keybinding, id)
    }

    return map
  }, [commandsIds])

  const lastEventRef = useRef<KeyboardEvent | null>(null)

  return useCallback(
    (event: React.KeyboardEvent | KeyboardEvent) => {
      const nativeEvent = 'nativeEvent' in event ? event.nativeEvent : event
      if (!triggerOnDefaultPrevented && nativeEvent.defaultPrevented) return

      // This handler may be registered at both the DOM and React levels; in that case we want to avoid registering /
      // handling the same event twice.
      if (lastEventRef.current === nativeEvent) return
      lastEventRef.current = nativeEvent

      if (!isShortcutAllowed(nativeEvent)) {
        sequenceTracker.reset()
        return
      }

      sequenceTracker.registerKeypress(nativeEvent)

      // First look for matching sequences, then for a matching hotkey for just this press
      const commandId =
        keybindingMap.get(sequenceTracker.sequence) ?? keybindingMap.get(eventToHotkeyString(nativeEvent))
      if (!commandId) return

      const handled = triggerCommand(commandId, nativeEvent) ?? true

      if (handled) {
        sequenceTracker.reset()
        event.preventDefault()
        event.stopPropagation()
        // avoids double triggering an event if an element is rendered twice
        // for example when a mobile version is hidden by CSS
        nativeEvent.stopImmediatePropagation()
      }
    },
    [keybindingMap, sequenceTracker, triggerCommand, triggerOnDefaultPrevented],
  )
}

import {useSyncExternalStore} from 'react'

let prefersReducedMotionQuery: MediaQueryList | undefined

function getQuery() {
  if (prefersReducedMotionQuery) return prefersReducedMotionQuery
  return (prefersReducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)'))
}

function getPrefersReducedMotionServer() {
  return false
}

function getPrefersReducedMotionClient() {
  return getQuery().matches
}

function subscribe(notify: () => void) {
  const mediaQuery = getQuery()
  mediaQuery.addEventListener('change', notify)
  return () => {
    mediaQuery.removeEventListener('change', notify)
  }
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getPrefersReducedMotionClient, getPrefersReducedMotionServer)
}

import {useEffect, useRef} from 'react'

/**
 * Tracks changes to a value across render cycles and returns the value that was used in the previous render cycle.
 * Note: This hook will return undefined on the first render cycle.
 */
export function usePreviousValue<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)

  useEffect(() => {
    ref.current = value
  }, [value])

  // eslint-disable-next-line react-hooks/refs
  return ref.current
}

import {ProfileReference} from '@github-ui/profile-reference'
import {BlockedIcon} from '@primer/octicons-react'
import {Link} from '@primer/react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {UserBlockedEvent$key} from './__generated__/UserBlockedEvent.graphql'
import {TimelineRow} from './row/TimelineRow'
import styles from './UserBlockedEvent.module.css'

type UserBlockedEventProps = {
  queryRef: UserBlockedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

export function UserBlockedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
}: UserBlockedEventProps): React.ReactElement {
  const {actor, createdAt, blockedUser, blockDuration, databaseId} = useFragment(
    // eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
    graphql`
      fragment UserBlockedEvent on UserBlockedEvent {
        databaseId
        createdAt
        blockDuration
        actor {
          ...TimelineRowEventActor
        }
        blockedUser: subject {
          login
          name
        }
      }
    `,
    queryRef,
  )
  const highlighted = String(databaseId) === highlightedEventId
  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={BlockedIcon}
    >
      <TimelineRow.Main>
        <span>{`${blockDuration !== 'PERMANENT' ? `${LABELS.timeline.temporarily} ` : ''} ${
          LABELS.timeline.blocked
        } `}</span>
        <Link href={`/${blockedUser?.login}`} inline className={styles.Link}>
          <ProfileReference login={blockedUser?.login ?? ''} profileName={blockedUser?.name} isAgent={false} />
        </Link>
      </TimelineRow.Main>
    </TimelineRow>
  )
}

import {useCallback, useEffect, useLayoutEffect, useRef} from 'react'

export const callbackCancelledResult = Symbol('callbackCancelledResult')
export type CallbackCancelledResult = typeof callbackCancelledResult

/**
 * Making async callbacks within React components is risky and error-prone. It's easy to
 * accidentally call an outdated reference to the function, or to call it after the
 * component has unmounted.
 *
 * This hook solves these problems by returning a function that is referentially constant
 * (it can never be outdated) and will have no effect if called after unmounting. If the
 * callback is cancelled due to calling after unmounting, the returned value will be
 * the unique symbol `callbackCancelledResult`.
 *
 * This callback is safe to call after `await`ing a `Promise` (or in the `.then` clause of a
 * `Promise`) and in `setTimeout`.
 *
 * @param fn the function to call
 * @param allowCallingAfterUnmount If the component is unmounted, should this be called?
 * This should typically be `false` but may be desirable in cases where user's changes would
 * not get saved unless the call is made, so the call can be made in the background after
 * unmount. If this is `true`, it's very important not to set state in this callback!
 */
export const useSafeAsyncCallback = <A extends unknown[], R>(
  fn: (...args: A) => R,
  allowCallingAfterUnmount = false,
): ((...args: A) => R | CallbackCancelledResult) => {
  const trackingRef = useRef(fn)
  useLayoutEffect(() => {
    trackingRef.current = fn
  }, [fn])

  const isMountedRef = useRef(false)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      if (!allowCallingAfterUnmount) isMountedRef.current = false
    }
  }, [allowCallingAfterUnmount])

  return useCallback(
    (...args: A) => (isMountedRef.current ? trackingRef.current(...args) : callbackCancelledResult),
    [], // this dependency array must always be empty
  )
}

import {useCallback, useEffect, useRef, useSyncExternalStore} from 'react'
import {sessionStorageStore} from './session-storage-store'
import type {Listener} from './create-store'

const {
  cache,
  readStorage,
  writeStorage,
  resetStorage,
  subscribe,
  clearKeys,
  clearKeysByPrefix,
  getItemsByPrefix,
  clearAll: clearAllSessionStorage,
} = sessionStorageStore

/**
 * Clears all store-tracked sessionStorage keys, their in-memory cache,
 * and the underlying browser sessionStorage.
 */
export function clearAllSessionStorageCache(): void {
  clearAllSessionStorage()
  if (typeof window !== 'undefined') {
    window.sessionStorage.clear()
  }
}

/**
 * Clears specified keys from sessionStorage and notifies subscribers
 */
export function clearSessionStorage(keys: string[]): void {
  clearKeys(keys)
}

/**
 * Get all items whose keys start with a prefix
 */
export function getSessionStorageItemsForKeyPrefix<T = unknown>(prefix: string): T[] {
  return getItemsByPrefix<T>(prefix)
}

/**
 * Clear all keys matching a prefix from sessionStorage
 */
export function clearSessionStorageByKeyPrefix(prefix: string): void {
  clearKeysByPrefix(prefix)
}

/**
 * React hook for sessionStorage with cross-component synchronization.
 * Returns [value, setValue, reset] tuple.
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Use ref for initialValue so it's available in callbacks without stale closure issues
  const initialValueRef = useRef(initialValue)
  useEffect(() => {
    initialValueRef.current = initialValue
  })

  // Seed lazily inside getSnapshot (idempotent) instead of during render
  // to avoid mutating external state in the render phase (concurrent-safe).
  // Uses initialValue directly (not ref) because getSnapshot runs during render
  // before the effect that updates initialValueRef.
  const getSnapshot = useCallback((): T => {
    if (!cache.has(key)) {
      readStorage(key, initialValue)
    }
    return cache.get(key) as T
  }, [key, initialValue])

  const getServerSnapshot = useCallback((): T => {
    return initialValue
  }, [initialValue])

  const subscribeToStore = useCallback((listener: Listener) => subscribe(key, listener), [key])

  const value = useSyncExternalStore(subscribeToStore, getSnapshot, getServerSnapshot)

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = cache.has(key) ? (cache.get(key) as T) : initialValueRef.current
      const resolved = typeof next === 'function' ? (next as (prev: T) => T)(current) : next
      // Treat undefined as a reset to avoid writing "undefined" string to storage
      if (resolved === undefined) {
        resetStorage(key, initialValueRef.current)
      } else {
        writeStorage(key, resolved)
      }
    },
    [key],
  )

  const reset = useCallback(() => {
    resetStorage(key, initialValueRef.current)
  }, [key])

  return [value, setValue, reset] as const
}

import {useAppPayload} from '@github-ui/react-core/use-app-payload'
import {useMemo} from 'react'

/**
 * Hook to get the SSO payload from the app payload
 *
 * @description If the app payload is not available, this hook will still return
 * an object with empty arrays for the SSO organizations and the default URLs
 *
 * @returns {SsoPayload} The SSO payload
 */
export const useSso = () => {
  const payload = useAppPayload<SsoAppPayload>()
  const ssoPayload = useMemo(() => {
    const ssoOrgs = payload?.sso_organizations ?? []
    const baseAvatarUrl = payload?.base_avatar_url ?? 'https://avatars.githubusercontent.com'
    return {ssoOrgs, baseAvatarUrl}
  }, [payload?.sso_organizations, payload?.base_avatar_url])

  return ssoPayload
}

export type SsoAppPayload = {
  base_avatar_url: string
  sso_organizations: Array<{[key: string]: string}>
}

import {useCallback, useLayoutEffect, useRef} from 'react'

/**
 * This hook allows us to avoid losing a callback reference on component re-renders by returning a function that is referentially constant (it can never be outdated).
 *
 * The hook will also remove the hook function reference on unmount.
 *
 * This hook is preferred over `useSafeAsyncCallback` when the callback is not async and you need the function reference to be available on first mount.
 *
 * @param fn the function to call
 * @throws {Error} if the callback is invoked after the component has unmounted
 */
export const useStableCallback = <A extends unknown[], R>(fn: (...args: A) => R): ((...args: A) => R) => {
  const trackingRef = useRef<((...args: A) => R) | null>(fn)
  useLayoutEffect((): (() => void) => {
    trackingRef.current = fn
    return () => (trackingRef.current = null)
  }, [fn])

  return useCallback((...args: A) => {
    if (trackingRef.current === null) {
      throw new Error('useStableCallback: Cannot call callback after component has unmounted')
    }
    return trackingRef.current(...args)
  }, [])
}

import {useMemo, useId} from 'react'

export function useStableRandom({max, min}: {max?: number; min?: number} = {}) {
  const id = useId()
  const index = useMemo(() => randFromId({id, max, min}), [id, max, min])
  return index
}

/**
 * Creates a seeded random number generator from a seed string.
 * Returns a function (index, max) => number that produces deterministic
 * values in [0, max) for each (seed, index) pair.
 * Use with `useId()` as the seed for SSR-safe randomness.
 */
export function createSeededRandom(seed: string) {
  return (index: number, max: number): number => {
    if (max <= 0) return 0
    const str = `${seed}:${index}`
    let hash = 5381
    for (const char of str) hash = ((hash << 5) + hash + char.charCodeAt(0)) | 0
    return (hash >>> 0) % max
  }
}

function randFromId({max, min, id}: {max?: number; min?: number; id: string}): number {
  let rand = hashId(id)

  if (min && rand < min) {
    rand = min
  }

  if (max) {
    rand = rand % max
  }

  return rand
}

function hashId(id: string): number {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 100
  return (hash % 40) + 40
}

import {useState} from 'react'
import {useIntersectionObserver} from './use-intersection-observer'

const DEFAULT_OPTIONS: IntersectionObserverInit = {
  root: null,
  rootMargin: '0px',
  threshold: [0, 1],
}

/**
 * Hook that detects whether a sensor element has scrolled out of view,
 * indicating a sticky header should be in its "stuck" state.
 *
 * Returns a callback ref (`sensorRef`) that should be placed on a sentinel
 * element at the sticky attachment point.
 *
 * @param observerOptions  Optional IntersectionObserver options override
 */
export function useStickyHeader(observerOptions: IntersectionObserverInit = DEFAULT_OPTIONS) {
  const [isSticky, setIsSticky] = useState(false)
  const [hasRoots, setHasRoots] = useState(false)

  const sensorRef = useIntersectionObserver(entries => {
    const entry = entries[entries.length - 1]
    if (entry) {
      setIsSticky(entry.intersectionRatio < 1)
      setHasRoots((entry.rootBounds?.height ?? 0) > 0)
    }
  }, observerOptions)

  return {isSticky, hasRoots, sensorRef}
}

import {useState} from 'react'
import type React from 'react'

type NotFunction<T> = T extends (...args: unknown[]) => unknown ? never : T

/**
 * State that stays in sync with a prop/external value.
 *
 * When `initialValue` changes (compared via `isEqual`), the state resets to match.
 * This is the "primitives in state" pattern from React docs:
 * https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 *
 * @param nextValue - The value to sync from (must not be a function)
 * @param opts.isPropUpdateDisabled - Skip syncing (e.g., while a form is dirty)
 * @param opts.isEqual - Comparison function, defaults to Object.is
 */
export function useSyncedState<T>(
  nextValue: NotFunction<T>,
  {isPropUpdateDisabled = false, isEqual = Object.is} = {},
): readonly [T, React.Dispatch<React.SetStateAction<T>>] {
  const [currentValue, setCurrentValue] = useState<T>(nextValue)
  const [previousValue, setPreviousValue] = useState<T>(nextValue)

  /**
   * This is _not_ done in effect, but instead during render.
   *
   * This is safe because it's in the same component. React will immediately queue an update, and
   * avoid the work in the render pass, which saves a potentially large render cycle that would
   * get thrown away immediately
   */
  if (!isPropUpdateDisabled && !isEqual(previousValue, nextValue)) {
    setPreviousValue(nextValue)
    setCurrentValue(nextValue)
    return [nextValue, setCurrentValue] as const
  }

  return [currentValue, setCurrentValue] as const
}

import {useCallback} from 'react'

const calculateNewCaretPosition = (
  originalCaretPosition: number,
  replaceRange: [number, number],
  insertLength: number,
): number => {
  const deleteLength = replaceRange[1] - replaceRange[0]
  const lengthDifference = insertLength - deleteLength

  // If caret is before the replacement, position is unaffected. If it is at/in the replacement
  // section, move it to the end (as though the user had selected text and typed
  // the replacement). If it is after the replacement, move it by the length difference.
  return originalCaretPosition < replaceRange[0]
    ? originalCaretPosition
    : originalCaretPosition < replaceRange[1]
      ? replaceRange[0] + insertLength
      : originalCaretPosition + lengthDifference
}

/**
 * Builds a fake `React.ChangeEvent` from a dispatched `InputEvent` instance.
 * This is only used as a fallback in cases where browsers don't support `execCommand`.
 */
const SyntheticChangeEvent = <Element extends HTMLElement>(
  dispatchedEvent: InputEvent,
  // Could use dispatchedEvent.target, but that would require a type assertion because InputEvent is not generic
  target: Element,
): React.ChangeEvent<Element> => ({
  // Spreading the event is particularly imperfect. Functions called on the `SyntheticEvent`
  // will have the wrong `this` binding and shallow object properties may fall out of sync.
  // We consider this acceptable since this is only the fallback behavior, but it's not ideal by any means.
  ...dispatchedEvent,
  nativeEvent: dispatchedEvent,
  target,
  // `currentTarget` is the element that the event listener is attached to. The event
  // doesn't know this, so `event.currentTarget` is `null`.
  currentTarget: target,
  preventDefault: () => dispatchedEvent.preventDefault(),
  isDefaultPrevented: () => dispatchedEvent.defaultPrevented,
  // This event doesn't bubble anyway so there's no need for the consumer to try to
  // stop propagation
  isPropagationStopped: () => false,
  // "As of v17, e.persist() doesn’t do anything because the SyntheticEvent is no
  // longer pooled" -  https://reactjs.org/docs/events.html#overview
  persist: () => ({
    /* noop */
  }),
})

type UseSyntheticChangeSettings<
  Element extends HTMLTextAreaElement | HTMLInputElement = HTMLTextAreaElement | HTMLInputElement,
> = {
  /** Ref to the input element to change. */
  inputRef: React.RefObject<Element | null>
  /**
   * A callback that will be triggered when the normal method of faking a synthetic event
   * fails. This should be the same function as the input's `onChange` handler.
   *
   * The ideal behavior is to simulate change as though a user had typed the value, which in
   * turn will call any change event handlers on the input. That doesn't work in all browsers,
   * so the fallback behavior is to call this handler with a simulated event.
   */
  fallbackEventHandler: React.ChangeEventHandler<Element>
}

/**
 * A function that, when called, will simulate a synthetic change event on the bound input.
 * @param insertValue The value to insert.
 * @param replaceRange The range of text to replace. By default, text will be inserted
 * as though the user typed it, replacing any currently selected text.
 * @param newSelection Selection to apply after the change. By default, the caret will
 * be automatically adjusted based on the replaced text, moving it to the end of the inserted
 * text if it was inside the `replaceRange` before. Can be a single number for a caret location
 * or two numbers for a selection range.
 */
export type SyntheticChangeEmitter = (
  insertValue: string,
  replaceRange?: [startIndexInclusive: number, endIndexExclusive: number],
  newSelection?: number | [number, number],
) => void

/**
 * Returns a function that will synthetically change the input, attempting to maintain caret position and undo history
 * as though the user had typed using a keyboard.
 *
 * Will first attempt to use the non-standard browser `execCommmand` API to simulate a typing
 * action. Failing this (ie, in test environments or certain browsers), the fallback handler
 * will be called with a fake constructed `ChangeEvent` that looks like a real event.
 */
export const useSyntheticChange = ({inputRef, fallbackEventHandler}: UseSyntheticChangeSettings) =>
  useCallback<SyntheticChangeEmitter>(
    (insertValue, replaceRange_, newSelection_) => {
      const input = inputRef.current
      if (!input) return

      // Remember the active element so we can restore its focus after the change
      const previousActiveElement = document.activeElement
      // The input needs to be focused for execCommand to work
      input.focus()

      const replaceRange = replaceRange_ ?? [
        input.selectionStart ?? input.value.length,
        input.selectionEnd ?? input.value.length,
      ]

      const newSelectionStart =
        newSelection_ === undefined
          ? calculateNewCaretPosition(input.selectionStart ?? input.value.length, replaceRange, insertValue.length)
          : Array.isArray(newSelection_)
            ? newSelection_[0]
            : newSelection_
      const newSelectionEnd = Array.isArray(newSelection_) ? newSelection_[1] : newSelectionStart

      // execCommmand simulates the user actually typing the value into the input. This preserves the undo history,
      // but it's a deprecated API and there's no alternative. It also doesn't work in test environments
      let execCommandResult = false
      try {
        // There is no guarantee the input is focused even after calling `focus()` on it. For example, the focus could
        // be trapped by an overlay. In that case we must prevent the change from happening in some unexpected target.
        if (document.activeElement !== input) throw new Error('Input must be focused to use execCommand')

        // expand selection to the whole range and replace it with the new value
        input.setSelectionRange(replaceRange[0], replaceRange[1])
        execCommandResult =
          insertValue === ''
            ? document.execCommand('delete', false)
            : document.execCommand('insertText', false, insertValue)
        input.setSelectionRange(newSelectionStart, newSelectionEnd)
      } catch {
        execCommandResult = false
      }

      // If previousActiveElement is an HTMLInputElement, restore focus
      // When this is triggered from e.g. inserting a saved reply into an editor,
      // focus and the cursor should remain in the editor.
      if (previousActiveElement instanceof HTMLInputElement || previousActiveElement instanceof HTMLTextAreaElement) {
        previousActiveElement.focus()
      }

      // If the execCommand method failed, call onChange instead - will nuke the undo history :(
      if (!execCommandResult) {
        const newValue = input.value.slice(0, replaceRange[0]) + insertValue + input.value.slice(replaceRange[1])

        // When building the event we could also define the inputType and data, but that would
        // be complex for the consumer to maintain. For now that's not functionality that is
        // strictly necessary.
        // React SyntheticChangeEvents are actually built around 'input' events, not 'change' events
        const event = new InputEvent('input', {bubbles: false})
        input.value = newValue
        input.setSelectionRange(newSelectionStart, newSelectionEnd)

        // Even though we call onChange manually, we must dispatch the event so the browser can
        // set its `target` and fully create it
        input.dispatchEvent(event)

        // Surprisingly, dispatching the event does not cause React to call handlers, even
        // though it looks almost exactly like a normal 'input' event. Maybe it's because the
        // event is not trusted? So we have to build and dispatch the `SyntheticEvent` ourselves.
        // This is not perfect but it gets pretty close.
        fallbackEventHandler(SyntheticChangeEvent(event, input))
      }
    },
    [inputRef, fallbackEventHandler],
  )

export interface CacheNode {
  title: string | null | undefined
  transients: Element[]
  bodyClasses: string | null | undefined
  replacedElements: Element[]
}

const DATA_TURBO_LOADED = 'data-turbo-loaded'

export function currentLocation() {
  return location.pathname
}

export function markTurboHasLoaded() {
  document.documentElement.setAttribute(DATA_TURBO_LOADED, '')
}

export function hasTurboLoaded() {
  return document.documentElement.hasAttribute(DATA_TURBO_LOADED)
}

// Check if an event target is a <turbo-frame>
export const isTurboFrame = (el: EventTarget | null): boolean => (el as Element)?.tagName === 'TURBO-FRAME'

// Checks if two urls start with the same "/owner/repo" prefix.
export function isSameRepo(url1: string, url2: string): boolean {
  const path1 = url1.split('/', 3).join('/')
  const path2 = url2.split('/', 3).join('/')
  return path1 === path2
}

// Checks if two urls start with the same "/owner" prefix.
export function isSameProfile(url1: string, url2: string): boolean {
  const path1 = url1.split('/', 2).join('/')
  const path2 = url2.split('/', 2).join('/')
  return path1 === path2
}

// Wait for all stylesheets to be loaded.
export async function waitForStylesheets() {
  const headStylesheets = document.head.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')
  const loadedStylesheets = new Set([...document.styleSheets].map(stylesheet => stylesheet.href))
  const promises = []

  for (const stylesheet of headStylesheets) {
    if (stylesheet.href === '' || loadedStylesheets.has(stylesheet.href)) continue
    promises.push(waitForLoad(stylesheet))
  }

  await Promise.all(promises)
}

const waitForLoad = (stylesheet: HTMLLinkElement, timeout = 2000): Promise<void> => {
  return new Promise(resolve => {
    const onComplete = () => {
      stylesheet.removeEventListener('error', onComplete)
      stylesheet.removeEventListener('load', onComplete)
      resolve()
    }

    stylesheet.addEventListener('load', onComplete, {once: true})
    stylesheet.addEventListener('error', onComplete, {once: true})
    setTimeout(onComplete, timeout)
  })
}

// Replaces all elements with `data-turbo-replace` with the ones coming from the Turbo response.
export const replaceElements = (html: Document, cachedElements?: Element[]) => {
  const newElements = cachedElements || html.querySelectorAll('[data-turbo-replace]')
  const oldElements = [...document.querySelectorAll('[data-turbo-replace]')]

  for (const newElement of newElements) {
    const oldElement = oldElements.find(el => el.id === newElement.id)

    if (oldElement) {
      oldElement.replaceWith(newElement.cloneNode(true))
    }
  }
}

// Adds all missing stylesheets that come from the Turbo response.
export const addNewStylesheets = (html: Document) => {
  // Only add stylesheets that aren't already in the page
  for (const el of html.querySelectorAll<HTMLLinkElement>('link[rel=stylesheet]')) {
    if (
      !document.head.querySelector(
        `link[href="${el.getAttribute('href')}"],
           link[data-href="${el.getAttribute('data-href')}"]`,
      )
    ) {
      document.head.append(el)
    }
  }
}

// Adds all missing scripts that come from the Turbo response.
export const addNewScripts = (html: Document) => {
  // Only add scripts that aren't already in the page
  for (const el of html.querySelectorAll<HTMLScriptElement>('script')) {
    if (!document.head.querySelector(`script[src="${el.getAttribute('src')}"]`)) {
      executeScriptTag(el)
    }
  }
}

// Load and execute scripts using standard script request.
export const copyScriptTag = (script: HTMLScriptElement) => {
  const {src} = script

  if (!src) {
    // we can't load a script without a source
    return
  }

  // eslint-disable-next-line github/no-dynamic-script-tag
  const newScript = document.createElement('script')
  const type = script.getAttribute('type')
  if (type) newScript.type = type

  newScript.src = src
  return newScript
}

// Load and execute scripts using standard script request.
const executeScriptTag = (script: HTMLScriptElement) => {
  const newScript = copyScriptTag(script)

  if (document.head && newScript) {
    document.head.appendChild(newScript)
  }
}

// Compares all `data-turbo-track="reload"` reload with the ones coming from the Turbo response.
export const getChangedTrackedKeys = (html: Document): string[] => {
  const changedKeys = []
  for (const meta of html.querySelectorAll<HTMLMetaElement>('meta[data-turbo-track="reload"]')) {
    if (
      document.querySelector<HTMLMetaElement>(`meta[http-equiv="${meta.getAttribute('http-equiv')}"]`)?.content !==
      meta.content
    ) {
      changedKeys.push(formatKeyToError(meta.getAttribute('http-equiv') || ''))
    }
  }

  return changedKeys
}

export const getTurboCacheNodes = (html: Document): CacheNode => {
  const head = html.querySelector('[data-turbo-head]') || html.head

  return {
    title: head.querySelector('title')?.textContent,
    transients: [...head.querySelectorAll('[data-turbo-transient]')].map(el => el.cloneNode(true) as Element),
    bodyClasses: html.querySelector<HTMLMetaElement>('meta[name=turbo-body-classes]')?.content,
    replacedElements: [...html.querySelectorAll('[data-turbo-replace]')].map(el => el.cloneNode(true) as Element),
  }
}

export const getDocumentAttributes = () => [...document.documentElement.attributes]

export const formatKeyToError = (key: string) => key.replace(/^x-/, '').replaceAll('-', '_')

export const dispatchTurboReload = (reason: string) =>
  document.dispatchEvent(new CustomEvent('turbo:reload', {detail: {reason}}))

export const dispatchTurboRestored = () => document.dispatchEvent(new CustomEvent('turbo:restored'))

export const replaceElementAttributes = (element: HTMLElement, newElement: HTMLElement) => {
  for (const attr of element.attributes) {
    if (!newElement.hasAttribute(attr.nodeName) && attr.nodeName !== 'aria-busy') {
      element.removeAttribute(attr.nodeName)
    }
  }

  for (const attr of newElement.attributes) {
    if (element.getAttribute(attr.nodeName) !== attr.nodeValue) {
      element.setAttribute(attr.nodeName, attr.nodeValue!)
    }
  }
}

export const VALUES = {
  copilot: {
    displayName: 'Copilot',
  },
  ghost: {
    login: 'ghost',
    avatarUrl: '/ghost.png',
    profileUrl: '/ghost',
  },
  lockedReasonStrings: {
    OFF_TOPIC: 'off topic',
    RESOLVED: 'resolved',
    SPAM: 'spam',
    TOO_HEATED: 'too heated',
  },
  labelQuery: (name: string) => `state:open label:"${name}"`,
  timeline: {
    majorEventTypes: [
      'IssueComment',
      'ClosedEvent',
      'ReopenedEvent',
      'CrossReferencedEvent',
      'ReferencedEvent',
      'PullRequestReview',
    ],
    borderedMajorEventTypes: ['IssueComment'],
    badgeSize: 18,
    pageSize: 150,
    virtualPageSize: 100,
    maxPreloadCount: 150,
    /** Data attribute used to identify all timeline item elements, used for a11y focusing behaviors */
    dataTimelineEventId: 'data-timeline-event-id',
    dataWrapperTimelineEventId: 'data-wrapper-timeline-id',
  },
  commitBadgeHelpUrl:
    'https://docs.github.com/github/authenticating-to-github/displaying-verification-statuses-for-all-of-your-commits',
  closingViaCommitMessageUrl: 'https://docs.github.com/articles/closing-issues-via-commit-messages',
  statusPage: 'https://www.githubstatus.com',
}

import {TableIcon} from '@primer/octicons-react'
import {Fragment} from 'react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {AddedToProjectV2Event$key} from './__generated__/AddedToProjectV2Event.graphql'
import styles from './AddedToProjectV2Event.module.css'
import {ProjectV2} from './ProjectV2'
import {RolledupProjectV2Event} from './RolledupProjectV2Event'
import {TimelineRow} from './row/TimelineRow'

type AddedToProjectV2EventProps = {
  queryRef: AddedToProjectV2Event$key
  issueUrl: string
  rollupGroup?: Record<string, Array<AddedToProjectV2Event$key | AddedToProjectV2Event$key>>
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
const AddedToProjectV2EventFragment = graphql`
  fragment AddedToProjectV2Event on AddedToProjectV2Event {
    databaseId
    createdAt
    actor {
      ...TimelineRowEventActor
    }
    project {
      title
      url
    }
  }
`

export function AddedToProjectV2Event({
  queryRef,
  issueUrl,
  rollupGroup,
  highlightedEventId,
  refAttribute,
}: AddedToProjectV2EventProps): React.ReactElement {
  const {actor, createdAt, project, databaseId} = useFragment(AddedToProjectV2EventFragment, queryRef)

  if (!project) {
    return <></>
  }

  const hightlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={hightlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      leadingIcon={TableIcon}
    >
      <TimelineRow.Main>
        {rollupGroup ? (
          <RolledupProjectV2Event rollupGroup={rollupGroup} />
        ) : (
          <AddedToProjectV2sRendering queryRefs={[queryRef]} />
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

export const AddedToProjectV2sRendering = ({queryRefs}: {queryRefs: AddedToProjectV2Event$key[]}) => {
  if (queryRefs.length === 0) {
    return null
  }

  return (
    <>
      {`${LABELS.timeline.addedThisTo} `}
      {queryRefs.map((queryRef, index) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key
        <Fragment key={index}>
          <InternalAddedToProjectV2sRendering
            queryRef={queryRef}
            first={index === 0}
            last={index === queryRefs.length - 1}
          />
        </Fragment>
      ))}
    </>
  )
}

const InternalAddedToProjectV2sRendering = ({
  queryRef,
  first,
  last,
}: Pick<AddedToProjectV2EventProps, 'queryRef'> & {
  first: boolean
  last: boolean
}) => {
  const {project} = useFragment(AddedToProjectV2EventFragment, queryRef)

  if (!project?.title || !project?.url) {
    return null
  }

  return (
    <span className={styles.projectNameWrapper}>
      <>
        {!first && !last && <span className={styles.commaSeparator}>,</span>}
        {!first && last && <span className={styles.andSeparator}>{LABELS.timeline.and}</span>}
        <ProjectV2 title={project?.title} url={project?.url} />
      </>
    </span>
  )
}

import {Link, RelativeTime} from '@primer/react'

import styles from './row.module.css'

type AgoProps = {
  timestamp: Date
  linkUrl?: string
}

export function Ago({timestamp, linkUrl}: AgoProps): React.ReactElement {
  return (
    <Link href={linkUrl} className={styles.timelineAgoLink}>
      <RelativeTime date={timestamp}>
        on {timestamp.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}
      </RelativeTime>
    </Link>
  )
}

import {PersonIcon} from '@primer/octicons-react'
import {Fragment} from 'react'
import {graphql} from 'react-relay'
import {useFragment} from 'react-relay/hooks'

import {LABELS} from '../constants/labels'
import {createIssueEventExternalUrl} from '../utils/urls'
import type {AssignedEvent$key} from './__generated__/AssignedEvent.graphql'
import styles from './assignees.module.css'
import {AssignmentEventAssignee} from './AssignmentEventAssignee'
import {RolledupAssignedEvent} from './RolledupAssignedEvent'
import {TimelineRow} from './row/TimelineRow'

type AssignedEventProps = {
  queryRef: AssignedEvent$key
  issueUrl: string
  onLinkClick?: (event: MouseEvent) => void
  highlightedEventId?: string
  refAttribute?: React.MutableRefObject<HTMLDivElement | null>
  rollupGroup?: Record<string, AssignedEvent$key[]>
}

// eslint-disable-next-line @github-ui/github-monorepo/restrict-relay-queries
const AssignedEventFragment = graphql`
  fragment AssignedEvent on AssignedEvent {
    databaseId
    createdAt
    actor {
      ...TimelineRowEventActor
      login
    }
    assignee {
      ...AssignmentEventAssignee @dangerously_unaliased_fixme
      ... on Actor {
        login
      }
    }
  }
`

export function AssignedEvent({
  queryRef,
  issueUrl,
  onLinkClick,
  highlightedEventId,
  refAttribute,
  rollupGroup,
}: AssignedEventProps): React.ReactElement {
  const {actor, createdAt, assignee, databaseId} = useFragment(AssignedEventFragment, queryRef)
  const highlighted = String(databaseId) === highlightedEventId

  return (
    <TimelineRow
      highlighted={highlighted}
      refAttribute={refAttribute}
      actor={actor}
      createdAt={createdAt}
      deepLinkUrl={createIssueEventExternalUrl(issueUrl, databaseId)}
      onLinkClick={onLinkClick}
      leadingIcon={PersonIcon}
    >
      <TimelineRow.Main>
        {rollupGroup ? (
          <RolledupAssignedEvent rollupGroup={rollupGroup} />
        ) : (
          <AddedAssigneesRendering
            queryRefs={[queryRef]}
            selfAssigned={actor?.login === assignee?.login}
            rollup={false}
          />
        )}
      </TimelineRow.Main>
    </TimelineRow>
  )
}

export const AddedAssigneesRendering = ({
  queryRefs,
  selfAssigned,
  rollup,
}: {
  queryRefs: AssignedEvent$key[]
  selfAssigned: boolean
  rollup: boolean
}) => {
  if (queryRefs.length === 0) {
    return null
  }

  return (
    <>
      {!selfAssigned && `${LABELS.timeline.assigned} `}
      {queryRefs.map((queryRef, index) => (
        // eslint-disable-next-line @eslint-react/no-array-index-key
        <Fragment key={index}>
          <InternalAddedAssigneesRendering
            queryRef={queryRef}
            rollup={rollup}
            first={index === 0}
            last={index === queryRefs.length - 1}
          />
        </Fragment>
      ))}
    </>
  )
}

const InternalAddedAssigneesRendering = ({
  queryRef,
  rollup,
  first,
  last,
}: Pick<AssignedEventProps, 'queryRef'> & {
  rollup: boolean
  first: boolean
  last: boolean
}) => {
  const {assignee, actor} = useFragment(AssignedEventFragment, queryRef)
  return (
    <div className={styles.assigneeEventContainer}>
      {actor?.login === assignee?.login && !rollup ? (
        LABELS.timeline.selfAssignedThis
      ) : (
        <>
          {!first && !last && <div className={styles.assigneeMarginRight}>,</div>}
          {!first && last && <div className={styles.assigneeMarginHorizontal}>{LABELS.timeline.and}</div>}
          <AssignmentEventAssignee assigneeRef={assignee} />
        </>
      )}
    </div>
  )
}
