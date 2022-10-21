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
      this.resources = game.township.resourceDisplayOrder.map(it => {
        return {
          name: it.name,
          media: it.media,
          amount: it.amount,
          netRate: game.township.getNetResourceRate(it),
        };
      });

      this.buildings = game.township.buildingDisplayOrder.map(building => {
        const biomes = [];
        for (let biome of building.biomes) {
          const resources = [];
          for (let [resource, amount] of building.provides.resources.entries()) {
            resources.push({
              name: resource.name,
              media: resource.media,
              amount: game.township.getSingleResourceGainAmountInBiome(resource, building, biome),
              workers: building.provides.workers.get(resource),
            });
          }
          const count = biome.buildingsBuilt.get(building) ?? 0;
          const freeCount = biome.availableInMap;
          const purchased = biome.amountPurchased;
          const total = biome.totalInMap;
          const canBePurchased = total - purchased;
          biomes.push({
            biome: biome.id,
            name: biome.name,
            count,
            freeCount,
            canBePurchased,
            media: BIOME_ICONS[biome.id],
            education: building.provides.education,
            happiness: building.provides.happiness,
            population: building.provides.population,
            storage: building.provides.storage,
            worship: building.provides.worship,
            resources
          });
        }

        const costs = [];
        for (let {resource, quantity} of building.costs) {
          costs.push({
            name: resource.name,
            media: resource.media,
            quantity,
          });
        }

        return {
          name: building.name,
          media: building.media,
          tier: building.tier,
          buildable: !building.upgradesFrom,
          upgradable: !!building.upgradesTo,
          costs,
          biomes
        };
      });
    },
    resources: [],
    buildings: [],
  };
}
window.TOTablePage = TOTablePage;

export function TOResourceRow({resource}) {
  return {
    $template: `#tso-resource-row`,
    resource,
    update() {
      this.tooltip.setContent(this.resource?.name);
    },
    mounted($el) {
      this.tooltip = tippy($el.querySelector('.skill-icon-xs'), {
        placement: 'bottom',
        allowHTML: true,
        interactive: false,
        animation: false,
      });
      this.update();
    },
    unmounted() {
      this.tooltip?.destroy();
      delete this.tooltip;
    },
  };
}
window.TOResourceRow = TOResourceRow;

export function TOBuildingRow({building}) {
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