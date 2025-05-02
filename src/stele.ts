import {
  AddToken as AddTokenEvent,
  Reward as RewardEvent,
  Create as CreateEvent,
  EntryFee as EntryFeeEvent,
  Join as JoinEvent,
  MaxAssets as MaxAssetsEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Register as RegisterEvent,
  RemoveToken as RemoveTokenEvent,
  RewardRatio as RewardRatioEvent,
  SeedMoney as SeedMoneyEvent,
  Swap as SwapEvent,
  SteleCreated as SteleCreatedEvent
} from "../generated/Stele/Stele"
import {
  Reward,
  Create,
  Join,
  Register,
  Swap,
  Token,
  Stele,
  Challenge
} from "../generated/schema"
import { BigInt, BigDecimal, Bytes, log, Address } from "@graphprotocol/graph-ts"
import { getDuration, STELE_ADDRESS } from "./utils/constants"
import { ERC20 } from "../generated/Stele/ERC20"

function fetchTokenDecimals(tokenAddress: Bytes): BigInt | null {
  let contract = ERC20.bind(Address.fromBytes(tokenAddress))
  let decimalsResult = contract.try_decimals()
  if (!decimalsResult.reverted) {
    return BigInt.fromI32(decimalsResult.value)
  }
  return null
}

function fetchTokenSymbol(tokenAddress: Bytes): string {
  let contract = ERC20.bind(Address.fromBytes(tokenAddress))
  let symbolResult = contract.try_symbol()
  if (!symbolResult.reverted) {
    return symbolResult.value
  }
  return "UNKNOWN"
}

export function handleSteleCreated(event: SteleCreatedEvent): void {
  let entity = new Stele(Bytes.fromHexString(STELE_ADDRESS))

  entity.owner = event.params.owner
  entity.usdToken = event.params.usdToken
  entity.rewardRatio = event.params.rewardRatio
  entity.seedMoney = event.params.seedMoney
  entity.entryFee = event.params.entryFee
  entity.maxAssets = event.params.maxAssets
  entity.challengeCounter= BigInt.fromI32(0)
  entity.investorCounter = BigInt.fromI32(0)
  entity.totalCurrentUSD = BigDecimal.fromString("0")

  entity.save()
}

export function handleAddToken(event: AddTokenEvent): void {
  let token = Token.load(event.params.tokenAddress)
  if (!token) {
    token = new Token(event.params.tokenAddress)
    token.tokenAddress = event.params.tokenAddress
    
    let decimals = fetchTokenDecimals(event.params.tokenAddress)
    if (decimals === null) {
      log.debug('the decimals on {} token was null', [event.params.tokenAddress.toHexString()])
      return
    }
    token.decimals = decimals
    token.symbol = fetchTokenSymbol(event.params.tokenAddress)
    token.isInvestable = true
    token.updatedTimestamp = event.block.timestamp
    token.save()
  } else {
    token.isInvestable = true
    token.updatedTimestamp = event.block.timestamp
    token.save()
  }
}

export function handleRemoveToken(event: RemoveTokenEvent): void {
  let entity = Token.load(event.params.tokenAddress)
  if (entity != null) {
    entity.isInvestable = false
    entity.updatedTimestamp = event.block.timestamp
    entity.save()
  }
}

export function handleRewardRatio(event: RewardRatioEvent): void {
  let stele = Stele.load(Bytes.fromHexString(STELE_ADDRESS))
  if (stele != null) {
    stele.rewardRatio = event.params.newRewardRatio
    stele.save()
  }
}

export function handleSeedMoney(event: SeedMoneyEvent): void {
  let stele = Stele.load(Bytes.fromHexString(STELE_ADDRESS))
  if (stele != null) {
    stele.seedMoney = event.params.newSeedMoney
    stele.save()
  }
}

export function handleEntryFee(event: EntryFeeEvent): void {
  let stele = Stele.load(Bytes.fromHexString(STELE_ADDRESS))
  if (stele != null) {
    stele.entryFee = event.params.newEntryFee
    stele.save()
  }
}

export function handleMaxAssets(event: MaxAssetsEvent): void {
  let stele = Stele.load(Bytes.fromHexString(STELE_ADDRESS))
  if (stele != null) {
    stele.maxAssets = event.params.newMaxAssets
    stele.save()
  }
}

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let stele = Stele.load(Bytes.fromHexString(STELE_ADDRESS))
  if (stele != null) {
    stele.owner = event.params.newOwner
    stele.save()
  }
}

export function handleCreate(event: CreateEvent): void {
  let create = new Create(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  create.challengeId = event.params.challengeId
  create.challengeType = event.params.challengeType
  create.blockNumber = event.block.number
  create.blockTimestamp = event.block.timestamp
  create.transactionHash = event.transaction.hash
  create.save()

  let challenge = new Challenge(
    event.transaction.hash.toHexString()
  )
  challenge.challengeId = event.params.challengeId.toString()
  challenge.challengeType = create.challengeType
  challenge.startTime = event.block.timestamp
  challenge.endTime = challenge.startTime.plus(getDuration(event.params.challengeType))
  challenge.investorCounter = BigInt.fromI32(0)

  //TODO : get seedMoney and entryFee from stele contract
  challenge.seedMoney = BigInt.fromI32(0)
  challenge.entryFee = BigInt.fromI32(0)
  challenge.rewardAmountUSD = BigInt.fromI32(0)
  challenge.isActive = true
  challenge.topUsers = []
  challenge.score = []
  challenge.save()
}

export function handleJoin(event: JoinEvent): void {
  let entity = new Join(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.challengeId = event.params.challengeId
  entity.user = event.params.user

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