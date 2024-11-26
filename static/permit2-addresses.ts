export function getPermit2Address(networkId: number): string | undefined {
    switch (networkId) {
        case 100:
        case 1:
        case 42161:
        case 10:
        case 137:
        case 8453:
        case 56:
        case 43114:
        case 42220:
        case 81457:
        case 7777777:
        case 480:
            return "0x000000000022D473030F116dDEE9F6B43aC78BA3";
        case 324:
            return "0x0000000000225e31d15943971f47ad3022f714fa";
        default:
            return undefined;
    }
}
