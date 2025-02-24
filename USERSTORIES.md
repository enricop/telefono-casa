
# Telefono-Casa User-Stories

### Target operating-system by user type:

- End users: https://en.wikipedia.org/wiki/Series_30%2B (conductor on the device!?)

- House holders: https://sailfishos.org/ (conductor on the device) (rust client)

- Village chiefs: https://en.wikipedia.org/wiki/Android (conductor on commune host) (typescript client)

- Commune officer: Linux/Windows desktop

### End-user agents stories

- End-user are agents that belongs to a family, only one family.

- Can create a profile. (as a link to their agent pubkey)

- Find all the villages in the commune.

- Can join a Commune by a [membrane proof](https://developer.holochain.org/resources/glossary/#membrane-proof) received as a signed authorization by a commune officer.

- Find all the families in the village.

- Can join a Family by a [capability-grant](https://developer.holochain.org/resources/glossary/#capability-grant) received as an invitation with a secret by an house-holder.

- Can vote an existing family, not their own one.

- Can VoIP call any end-user of families that have a least the same number of votes of the caller family. The callee family should belong to the same village.

- Can VoIP call any village chiefs.

### House-holders agents stories

- Have the same base capabilities of end-users agests.

### Village Chiefs agents stories

- Have the same base capabilities of house-holders agests.

### Commune Officer agents stories

- Have the same base capabilities of village-chiefs agests.
