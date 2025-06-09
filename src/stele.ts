import {
  AddToken as AddTokenEvent,
  Create as CreateEvent,
  EntryFee as EntryFeeEvent,
  Join as JoinEvent,
  MaxAssets as MaxAssetsEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Register as RegisterEvent,
  RemoveToken as RemoveTokenEvent,
  Reward as RewardEvent,
  RewardRatio as RewardRatioEvent,
  SeedMoney as SeedMoneyEvent,
  SteleCreated as SteleCreatedEvent,
  SteleTokenBonus as SteleTokenBonusEvent,
  Swap as SwapEvent
} from "../generated/Stele/Stele"
import {
  AddToken,
  Create,
  EntryFee,
  Join,
  MaxAssets,
  OwnershipTransferred,
  Register,
  RemoveToken,
  Reward,
  RewardRatio,
  SeedMoney,
  SteleCreated,
  SteleTokenBonus,
  Swap
} from "../generated/schema"

export function handleAddToken(event: AddTokenEvent): void {
  let entity = new AddToken(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenAddress = event.params.tokenAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCreate(event: CreateEvent): void {
  let entity = new Create(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.challengeType = event.params.challengeType
  entity.seedMoney = event.params.seedMoney
  entity.entryFee = event.params.entryFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleEntryFee(event: EntryFeeEvent): void {
  let entity = new EntryFee(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newEntryFee = event.params.newEntryFee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleJoin(event: JoinEvent): void {
  let entity = new Join(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.user = event.params.user
  entity.seedMoney = event.params.seedMoney

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMaxAssets(event: MaxAssetsEvent): void {
  let entity = new MaxAssets(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newMaxAssets = event.params.newMaxAssets

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRegister(event: RegisterEvent): void {
  let entity = new Register(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.user = event.params.user
  entity.performance = event.params.performance

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRemoveToken(event: RemoveTokenEvent): void {
  let entity = new RemoveToken(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tokenAddress = event.params.tokenAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleReward(event: RewardEvent): void {
  let entity = new Reward(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.user = event.params.user
  entity.rewardAmount = event.params.rewardAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRewardRatio(event: RewardRatioEvent): void {
  let entity = new RewardRatio(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newRewardRatio = event.params.newRewardRatio

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSeedMoney(event: SeedMoneyEvent): void {
  let entity = new SeedMoney(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newSeedMoney = event.params.newSeedMoney

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSteleCreated(event: SteleCreatedEvent): void {
  let entity = new SteleCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.usdToken = event.params.usdToken
  entity.maxAssets = event.params.maxAssets
  entity.seedMoney = event.params.seedMoney
  entity.entryFee = event.params.entryFee
  entity.rewardRatio = event.params.rewardRatio

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSteleTokenBonus(event: SteleTokenBonusEvent): void {
  let entity = new SteleTokenBonus(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.user = event.params.user
  entity.action = event.params.action
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSwap(event: SwapEvent): void {
  let entity = new Swap(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.user = event.params.user
  entity.fromAsset = event.params.fromAsset
  entity.toAsset = event.params.toAsset
  entity.fromAmount = event.params.fromAmount
  entity.toAmount = event.params.toAmount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
