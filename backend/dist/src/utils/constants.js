"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTRACT_ABIS = exports.CONTRACT_ADDRESSES = void 0;
exports.CONTRACT_ADDRESSES = {
    CADEM_TOKEN: process.env.CADEM_TOKEN_ADDRESS || '',
    NFT_CONTRACT: process.env.NFT_CONTRACT_ADDRESS || '',
    MARKETPLACE: process.env.MARKETPLACE_ADDRESS || '',
};
exports.CONTRACT_ABIS = {
    // You'll get these from your Solidity developer
    ERC20: require('./abis/CademToken.json'),
    ERC721: require('./abis/CademNFT.json'),
    MARKETPLACE: require('./abis/Marketplace.json'),
};
