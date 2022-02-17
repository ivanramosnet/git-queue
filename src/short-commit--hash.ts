import {Nullable} from './nullable'

const NO_SHORT_COMMIT_HASH = '--no-short-commit-hash--'

/**
 * 7-character commit hash
 */
export class ShortCommitHash implements Nullable {
  private value: string

  constructor(value: string) {
    // TODO: validation
    this.value = value
  }

  getHash(): string {
    return this.value
  }

  isNull(): boolean {
    return this.value === NO_SHORT_COMMIT_HASH
  }

  equalsTo(other: ShortCommitHash): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}

export function nullShortCommitHash(): ShortCommitHash {
  return new ShortCommitHash(NO_SHORT_COMMIT_HASH)
}
