const ALLIANCE_NAMESPACE = 'com.got.alliance'
const ALLIANCE_REGISTRY_PATH = 'com.got.alliance.Alliance'
const FAMILY_NAMESPACE = 'com.got.family'
const FAMILY_REGISTRY_PATH = 'com.got.family.Family'

/**
 * Create Alliance Transaction
 * @param {com.got.alliance.CreateAlliance} data
 * @transaction
 */

async function CreateAlliance (data) {
  const factory = getFactory()

  const Id = data.allianceId
  const alliance = factory.newResource(ALLIANCE_NAMESPACE, 'Alliance', Id)
  const event = factory.newEvent(ALLIANCE_NAMESPACE, 'AllianceCreated')
  
  alliance.allianceId = Id
  alliance.name = data.name
  alliance.families = data.families
  event.allianceId  = Id
  event.name = data.name
  event.families = data.families

  emit(event)
  const assetRegistry = await getAssetRegistry(ALLIANCE_REGISTRY_PATH)
  return assetRegistry.add(alliance)
}

/**
 * Add Family To Alliance Transaction
 * @param {com.got.alliance.AddFamilyToAlliance} data
 * @transaction
 */
async function AddFamilyToAlliance (data) {
  const allianceRegistry = await getAssetRegistry(ALLIANCE_REGISTRY_PATH)
  const alliance = await allianceRegistry.get(data.allianceId)

  const newFamily = await createFamily(data.familyId, data.name, alliance)
  alliance.families.push(newFamily)

  const factory = getFactory()
  const event = factory.newEvent(ALLIANCE_NAMESPACE, 'FamilyAdded')
  event.alliance = alliance
  event.family = newFamily
  emit(event)
  
  return allianceRegistry.update(alliance)
}

async function createFamily (familyId, name, alliance) {
  const factory = getFactory()

  const family = factory.newResource(FAMILY_NAMESPACE, 'Family', familyId)
  const event = factory.newEvent(FAMILY_NAMESPACE, 'FamilyCreated')
 
  family.name = name
  family.alliance = alliance
  event.familyId = familyId
  event.name = name
  event.alliance = alliance

  emit(event)
  const assetRegistry = await getAssetRegistry(FAMILY_REGISTRY_PATH)
  await assetRegistry.add(family)
  return family
}

/**
 * Transfer Family Transaction
 * @param {com.got.alliance.TransferFamily} data
 * @transaction
 */
async function TransferFamily (data) {
  const allianceRegistry = await getAssetRegistry(ALLIANCE_REGISTRY_PATH)
  const currentAlliance = await allianceRegistry.get(data.currentAllianceId)
  const newAlliance = await allianceRegistry.get(data.newAllianceId)

  const familyRegistry = await getAssetRegistry(FAMILY_REGISTRY_PATH)
  const family = await familyRegistry.get(data.familyId)

  currentAlliance.families = removeFamilyFromArray(currentAlliance.families, family)
  newAlliance.families.push(family)
  family.alliance = newAlliance
  
  const factory = getFactory()
  const event = factory.newEvent(ALLIANCE_NAMESPACE, 'FamilyTransferred')
  event.oldAlliance = currentAlliance
  event.newAlliance = newAlliance
  event.family = family
  emit(event)
  
  await allianceRegistry.update(currentAlliance)
  await allianceRegistry.update(newAlliance)
  await familyRegistry.update(family)
  return
}

function removeFamilyFromArray(families, family) {
  for (i = 0; i < families.length; i++) {
    if(families[i].$identifier === family.$identifier) {
      families.splice(i, 1)
      return families
    }
  }
} 