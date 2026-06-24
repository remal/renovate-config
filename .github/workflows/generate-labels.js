const path = require('path');
const fs = require('fs');

const {AllManagersListLiteral, CustomManagersListLiteral} = require('renovate/dist/manager-list.generated');
const {getOptions} = require('renovate/dist/config/options/index');

const options = getOptions();

const updateTypes = options.find(o => o.name === 'matchUpdateTypes').allowedValues;

const customManagers = new Set(CustomManagersListLiteral);

const categories = new Set();
const uncategorizedManagers = [];

for (const manager of [...AllManagersListLiteral, ...CustomManagersListLiteral]) {
    const isCustom = customManagers.has(manager);
    try {
        const mod = require(`renovate/dist/modules/manager/${manager}/index`);
        const exportKey = Object.keys(mod).find(k => k.endsWith('_exports'));
        if (!exportKey) {
            uncategorizedManagers.push({match: isCustom ? `custom.${manager}` : manager, label: manager});
            continue;
        }
        const {categories: managerCategories} = mod[exportKey];
        if (managerCategories && managerCategories.length > 0) {
            managerCategories.forEach(c => categories.add(c));
        } else {
            uncategorizedManagers.push({match: isCustom ? `custom.${manager}` : manager, label: manager});
        }
    } catch {
        uncategorizedManagers.push({match: isCustom ? `custom.${manager}` : manager, label: manager});
    }
}

const config = {
    $schema: 'https://docs.renovatebot.com/renovate-schema.json',
    description: 'Pull Request labels',
    addLabels: ['renovate', 'dependencies'],
    group: {
        addLabels: ['dependencies-group'],
    },
    vulnerabilityAlerts: {
        addLabels: ['security', 'dependencies-security'],
    },
};

const packageRules = [];

for (const type of updateTypes) {
    packageRules.push({
        matchUpdateTypes: [type],
        addLabels: [`dependencies-${type}`],
    });
}

for (const category of [...categories].sort()) {
    packageRules.push({
        matchCategories: [category],
        addLabels: [`dependencies-${category}`],
    });
}

for (const {match, label} of uncategorizedManagers.sort((a, b) => a.label.localeCompare(b.label))) {
    packageRules.push({
        matchManagers: [match],
        addLabels: [`dependencies-${label}`],
    });
}

config.packageRules = packageRules;

const outputPath = path.resolve(process.cwd(), 'labels.json');
fs.writeFileSync(outputPath, JSON.stringify(config, null, 2) + '\n');
console.log(`Generated labels.json: ${[...categories].sort().length} categories, ${uncategorizedManagers.length} uncategorized managers, ${updateTypes.length} update types`);
