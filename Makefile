#--combined-json abi,asm,ast,bin,bin-runtime,devdoc,function-debug,function-debug-runtime,generated-sources,generated-sources-runtime,hashes,metadata,opcodes,srcmap,srcmap-runtime,storage-layout,userdoc
all: build/Articles.bin build/Profiles.bin build/QuickReg.bin build/Sponsor.bin build/Chat.bin build/Membership.bin build/mcall.bin

build/Membership.bin: contracts/Membership.sol
	solc contracts/Membership.sol -o build --overwrite --bin --no-cbor-metadata --optimize --abi

build/Chat.bin: contracts/Chat.sol
	solc contracts/Chat.sol -o build --overwrite --bin --no-cbor-metadata --optimize --abi

build/Sponsor.bin: contracts/Sponsor.sol
	solc contracts/Sponsor.sol -o build --overwrite --bin --no-cbor-metadata --optimize --abi

build/QuickReg.bin: contracts/QuickReg.sol
	solc contracts/QuickReg.sol -o build --overwrite --bin-runtime --no-cbor-metadata --optimize --abi

build/mcall.bin: contracts/mcall.sol
	solc contracts/mcall.sol -o build --overwrite --bin-runtime --no-cbor-metadata --optimize --abi

build/Articles.bin: contracts/Articles.sol
	solc --abi --bin contracts/Articles.sol -o build --overwrite --storage-layout --opcodes --evm-version=paris

build/Profiles.bin: contracts/Profiles.sol
	solc --abi --bin contracts/Profiles.sol -o build --overwrite --storage-layout --opcodes --evm-version=paris
	#--gas
