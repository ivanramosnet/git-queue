import {CommitHash, nullCommitHash} from './commit-hash'
import {
  MissingCommitHashInJobReferenceError,
  MissingJobIdInCommitSubjectError,
  MissingMessageKeyInCommitSubjectError,
  MissingQueueNameInCommitSubjectError
} from './errors'
import {CommitSubject} from './commit-subject'
import {MessageKey} from './message-key'
import {QueueName} from './queue-name'

export const COMMIT_SUBJECT_PREFIX = '📝'
export const COMMIT_SUBJECT_DELIMITER = ':'
export const COMMIT_SUBJECT_JOB_REF_PREFIX = 'job.ref.'
export const COMMIT_SUBJECT_JOB_ID_PREFIX = 'job.id.'

export function commitSubjectBelongsToAQueue(subject: string): boolean {
  return CommitSubjectParser.commitSubjectBelongsToAQueue(subject)
}

export class CommitSubjectParser {
  private text: string

  constructor(text: string) {
    this.text = text
  }

  static commitSubjectBelongsToAQueue(subject: string): boolean {
    return subject.startsWith(COMMIT_SUBJECT_PREFIX)
  }

  static parseText(text: string): CommitSubject {
    const parser = new CommitSubjectParser(text)
    return new CommitSubject(
      parser.getMessageKey(),
      parser.getQueueName(),
      parser.getJobRef(),
      parser.getJobId()
    )
  }

  static toText(commitSubject: CommitSubject): string {
    const jobRef = commitSubject.getJobRef().isNull()
      ? ''
      : ` ${COMMIT_SUBJECT_JOB_REF_PREFIX}${commitSubject
          .getJobRef()
          .toString()}`

    const jobId =
      commitSubject.getJobId() === -1
        ? ''
        : ` ${COMMIT_SUBJECT_JOB_ID_PREFIX}${commitSubject
            .getJobId()
            .toString()}`

    return `${COMMIT_SUBJECT_PREFIX}${commitSubject
      .getMessageKey()
      .toString()}${COMMIT_SUBJECT_DELIMITER} ${commitSubject
      .getQueueName()
      .toString()}${COMMIT_SUBJECT_DELIMITER}${jobId}${jobRef}`
  }

  getQueueName(): QueueName {
    const parts = this.text.split(COMMIT_SUBJECT_DELIMITER)

    if (parts[1] === undefined) {
      throw new MissingQueueNameInCommitSubjectError(this.text)
    }

    const queueName = parts[1].trim()

    if (queueName === '') {
      throw new MissingQueueNameInCommitSubjectError(this.text)
    }

    return new QueueName(parts[1].trim())
  }

  getMessageKey(): MessageKey {
    const queuePrefix = this.text.indexOf(COMMIT_SUBJECT_PREFIX)
    const colonPos = this.text.indexOf(COMMIT_SUBJECT_DELIMITER)
    const messageKey = this.text.substring(
      queuePrefix + COMMIT_SUBJECT_PREFIX.length,
      colonPos
    )

    if (messageKey === '') {
      throw new MissingMessageKeyInCommitSubjectError(this.text)
    }

    return new MessageKey(
      this.text.substring(queuePrefix + COMMIT_SUBJECT_PREFIX.length, colonPos)
    )
  }

  getJobRef(): CommitHash {
    const jobRef = this.text.indexOf(COMMIT_SUBJECT_JOB_REF_PREFIX)

    if (jobRef === -1) {
      return nullCommitHash()
    }

    const commitHash = this.text
      .substring(jobRef + COMMIT_SUBJECT_JOB_REF_PREFIX.length)
      .trim()

    if (commitHash === '') {
      throw new MissingCommitHashInJobReferenceError(this.text)
    }

    return new CommitHash(commitHash)
  }

  getJobId(): number {
    const jobIdPosition = this.text.indexOf(COMMIT_SUBJECT_JOB_ID_PREFIX)

    if (jobIdPosition === -1) {
      throw new MissingJobIdInCommitSubjectError(this.text)
    }

    const nextTokenPosition = this.text.indexOf(' ', jobIdPosition)

    const jobId = parseInt(
      this.text
        .substring(
          jobIdPosition + COMMIT_SUBJECT_JOB_ID_PREFIX.length,
          nextTokenPosition === -1 ? this.text.length : nextTokenPosition
        )
        .trim()
    )

    if (isNaN(jobId)) {
      throw new MissingJobIdInCommitSubjectError(this.text)
    }

    return jobId
  }
}
