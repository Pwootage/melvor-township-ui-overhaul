const BIOME_ICONS = {
  'melvorF:Grasslands': 'assets/media/skills/combat/goblin_village.svg',
  'melvorF:Forest': 'assets/media/shop/woodcutting_multi_tree.svg',
  'melvorF:Desert': 'assets/media/skills/combat/desolate_plains.svg',
  'melvorF:Water': 'assets/media/skills/combat/dark_waters.svg',
  'melvorF:Swamp': 'assets/media/skills/combat/toxic_swamps.svg',
  'melvorF:Arid_Plains': 'assets/media/skills/combat/arid_plains.svg',
  'melvorF:Mountains': 'assets/media/skills/combat/perilous_peaks.svg',
  'melvorF:Valley': 'assets/media/skills/combat/dragon_valley.svg',
  'melvorF:Jungle': 'assets/media/skills/combat/wet_forest.svg',
  'melvorF:Snowlands': 'assets/media/skills/combat/icy_hills.svg'
};
const BIOME_SHORT = {
  'melvorF:Grasslands': 'GL',
  'melvorF:Forest': 'FS',
  'melvorF:Desert': 'DS',
  'melvorF:Water': 'WR',
  'melvorF:Swamp': 'SW',
  'melvorF:Arid_Plains': 'AP',
  'melvorF:Mountains': 'MT',
  'melvorF:Valley': 'VY',
  'melvorF:Jungle': 'JG',
  'melvorF:Snowlands': 'SL'
};

function plusIfPositive(value) {
  return value > 0 ? '+' : '';
}
window.plusIfPositive = plusIfPositive;

export function TOTablePage(params) {
  return {
    $template: `#tso-table-page`,
    update() {
      // this is a really stupid hack but is the only way I could figure out how to get the ui to actually update
      // I have no idea why the UI isn't updating, it's entirely new objects every single time...
      this.hideAll = true;
      this.$nextTick(() => {
        this.hideAll = false;
      });
      if (this.resourceFilters.length == 0) {
        for (const resource of game.township.resourceDisplayOrder) {
          this.resourceFilters.push({
            resource: {
              id: resource.id,
              name: resource.name,
              media: resource.media,
              amount: resource.amount,
              netRate: game.township.getNetResourceRate(resource),
            }
          });
        }
      } else {
        for (const filter of this.resourceFilters) {
          filter.resource.amount = game.township.resources.getObjectByID(filter.resource.id).amount;
          filter.resource.netRate = game.township.getNetResourceRate(game.township.resources.getObjectByID(filter.resource.id));
        }
      }

      this.buildings = game.township.buildingDisplayOrder.map(building => {
        const biomes = [];
        for (let biome of building.biomes) {
          const resources = [];
          const upgradeProvides = building.upgradesTo?.provides;
          const upgradeProvidesResources = upgradeProvides?.resources ?? new Map();
          for (let [resource, amount] of building.provides.resources.entries()) {
            const upgradeProvidesResource = upgradeProvidesResources.get(resource);
            let upgradeAmount;
            if (upgradeProvidesResource) {
              upgradeAmount = game.township.getSingleResourceGainAmountInBiome(resource, building.upgradesTo, biome)
            }
            resources.push({
              id: resource.id,
              name: resource.name,
              media: resource.media,
              amount: game.township.getSingleResourceGainAmountInBiome(resource, building, biome),
              upgradeAmount,
              workers: building.provides.workers.get(resource),
            });
          }
          const count = biome.buildingsBuilt.get(building) ?? 0;
          const purchased = biome.amountPurchased;
          const total = biome.totalInMap;
          const canBePurchased = total - purchased;
          const freeCount = purchased - [...biome.buildingsBuilt.values()].reduce((a, b) => a + b, 0);

          biomes.push({
            biome: biome.id,
            name: biome.name,
            count,
            freeCount,
            canBePurchased,
            media: BIOME_ICONS[biome.id],
            education: building.provides.education,
            upgradeEducation: upgradeProvides?.education,
            happiness: building.provides.happiness,
            upgradeHappiness: upgradeProvides?.happiness,
            population: building.provides.population,
            upgradePopulation: upgradeProvides?.population,
            storage: building.provides.storage,
            upgradeStorage: upgradeProvides?.storage,
            worship: building.provides.worship,
            upgradeWorship: upgradeProvides?.worship,
            resources,
          });
        }

        const costs = [];
        for (let { resource, quantity } of building.costs) {
          costs.push({
            name: resource.name,
            media: resource.media,
            quantity,
            met: resource.amount >= quantity,
          });
        }

        const upgradeCosts = [];
        for (let { resource, quantity } of building.upgradesTo?.costs ?? []) {
          upgradeCosts.push({
            name: resource.name,
            media: resource.media,
            quantity,
            met: resource.amount >= quantity,
          });
        }


        const townshipLevel = game.township.level;
        const townshipPop = game.township.citizens.length;

        const levelRequired = game.township.populationForTier[building.tier].level;
        const popRequired = game.township.populationForTier[building.tier].population;
        const resourcesMet = building.costs.every(({ resource, quantity }) => resource.amount >= quantity);

        const reqsMet = (townshipLevel >= levelRequired) && (townshipPop >= popRequired);

        const buildable = !building.upgradesFrom;
        const upgradable = !!building.upgradesTo;
        let upgradeReqsMet = false;
        let upgradeResourcesMet = false;
        if (upgradable) {
          const upgradeLevelRequired = game.township.populationForTier[building.upgradesTo.tier].level;
          const upgradePopRequired = game.township.populationForTier[building.upgradesTo.tier].population;
          upgradeResourcesMet = building.upgradesTo.costs.every(({ resource, quantity }) => resource.amount >= quantity);
          upgradeReqsMet = (townshipLevel >= upgradeLevelRequired) && (townshipPop >= upgradePopRequired);
        }

        const anyBiomeBuildable = (buildable && biomes.some(biome => biome.canBePurchased > 0));
        const anyBiomeUpgradable = (upgradable && biomes.some(biome => biome.count > 0));

        return {
          name: building.name,
          id: building.id,
          media: building.media,
          tier: building.tier,
          reqsMet,
          resourcesMet,
          buildable,
          upgradable,
          upgradeToId: building.upgradesTo?.id,
          upgradeReqsMet,
          upgradeResourcesMet,
          anyBiomeBuildable,
          anyBiomeUpgradable,
          levelRequired,
          popRequired,
          costs,
          upgradeCosts,
          biomes
        };
      });
    },
    setFilter(filter) {
      if (this.currentFilter == filter) {
        this.currentFilter = null;
      } else {
        this.currentFilter = filter;
      }
      if (filter.clear) {
        this.currentFilter = null;
      }
    },
    build(building, biome) {
      game.township.setBuildQty(1);
      game.township.upgradeQty = 1;
      townshipUI.updateAllBuildingUpgradeCosts();
      townshipUI.updateUpgradeDropdowns();
      game.township.setTownBiome(game.township.biomes.getObjectByID(biome.biome));
      game.township.setBuildBiome(game.township.biomes.getObjectByID(biome.biome));
      game.township.buildBuilding(game.township.buildings.getObjectByID(building.id));
    },
    upgrade(building, biome) {
      game.township.setBuildQty(1);
      game.township.upgradeQty = 1;
      townshipUI.updateAllBuildingUpgradeCosts();
      townshipUI.updateUpgradeDropdowns();
      game.township.setTownBiome(game.township.biomes.getObjectByID(biome.biome));
      game.township.setBuildBiome(game.township.biomes.getObjectByID(biome.biome));
      game.township.buildBuilding(game.township.buildings.getObjectByID(building.upgradeToId));
    },
    get filteredBuildings() {
      const filter = this.currentFilter;
      if (!filter || filter.clear) return this.buildings;
      if (filter.population) return this.buildings.filter(building => building.biomes.some(biome => biome.population > 0));
      if (filter.education) return this.buildings.filter(building => building.biomes.some(biome => biome.education > 0));
      if (filter.happiness) return this.buildings.filter(building => building.biomes.some(biome => biome.happiness > 0));
      if (filter.worship) return this.buildings.filter(building => building.biomes.some(biome => biome.worship > 0));
      if (filter.storage) return this.buildings.filter(building => building.biomes.some(biome => biome.storage > 0));
      if (filter.resource) return this.buildings.filter(building => building.biomes.some(biome => biome.resources.some(resource => resource.id == filter.resource.id && resource.amount > 0)));

      return this.buildings
    },
    currentFilter: null,
    filters: [
      { clear: true },
      { population: { current: game.township.currentPopulation, max: game.township.populationLimit } },
      { happiness: { current: game.township.townData.happiness, max: game.township.maxHappiness } },
      { storage: { current: game.township.getUsedStorage().toFixed(0), max: game.township.getMaxStorage() } },
      { education: { current: game.township.townData.education, max: game.township.maxEducation } },
      { worship: { current: game.township.townData.worshipCount, max: game.township.MAX_WORSHIP } },
    ],
    resourceFilters: [],
    buildings: [],
    hideAll: false,
    showLocked: false,
    showUnbuildable: false,
    showOnlyUpgradable: false,
  };
}
window.TOTablePage = TOTablePage;

export function TOFilterRow({ filter }) {
  return {
    $template: `#tso-filter-row`,
    clear: filter.clear,
    resource: filter.resource,
    population: filter.population,
    happiness: filter.happiness,
    storage: filter.storage,
    education: filter.education,
    worship: filter.worship,
    update() {
    },
    mounted($el) {
      this.update();
    },
    unmounted() {
    },
  };
}
window.TOFilterRow = TOFilterRow;

export function TOBuildingRow(building) {
  return {
    $template: `#tso-building-row`,
    building,
    update() {
      // this.tooltip.setContent(this.building.name);
    },
    mounted($el) {
      // this.tooltip = tippy($el.querySelector('.skill-icon-xs'), {
      //   placement: 'bottom',
      //   allowHTML: true,
      //   interactive: false,
      //   animation: false,
      // });
      this.update();
    },
    unmounted() {
      this.tooltip?.destroy();
      delete this.tooltip;
    },
  };
}
window.TOBuildingRow = TOBuildingRow;