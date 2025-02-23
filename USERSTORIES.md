
# Telefono-Casa User-Stories

### Target operating-system by user type:

- End users: https://en.wikipedia.org/wiki/Series_30%2B (conductor on the device!?)

- House holders: https://sailfishos.org/ (conductor on the device) (rust client)

- Village chiefs: https://en.wikipedia.org/wiki/Android (p2p Shipyard - conductor on commune host) (javascript client)

- Commune officer: Linux/Windows desktop

### End-user agents stories

- End-user are agents that belongs to a family, only one family.

- Can create a profile. (as a link to their agent pubkey)

- Can join a Commune by a [membrane proof](https://developer.holochain.org/resources/glossary/#membrane-proof) (receiving a signed authorization by a commune officer)

- Can join a Family by a [capability-grant](https://developer.holochain.org/resources/glossary/#capability-grant) (receiving an invitation with a secret by an house-holder)

- Find all the end-users in the village organized by family name

- Can vote an existing family

- Can VoIP call any end-user of families that have a least the same number of votes of the caller family. The callee family should belong to the same village.

- Can VoIP call any house-holders of the same village.

- Can VoIP call any village chiefs.

### House-holders agents stories

- Have the same base capabilities of end-users agests.

### Village Chiefs agents stories

- Have the same base capabilities of house-holders agests.

### Commune Officer agents stories

- Have the same base capabilities of village-chiefs agests.
