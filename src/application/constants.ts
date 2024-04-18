import { sortBy } from 'lodash';
import daos from './daos.json';

const daosForSelect = sortBy(daos, 'name').map((dao) => ({
  label: dao.name,
  value: dao.slug,
}));

export { daos, daosForSelect };
