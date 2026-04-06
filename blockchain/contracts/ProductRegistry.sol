// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProductRegistry {

    address public admin;

    struct Product {
        uint256 productId;
        string name;
        string batchNumber;
        string manufacturingDate;
        string description;
        address manufacturer;
        bool exists;
    }

    mapping(uint256 => Product) public products;
    mapping(address => bool) public approvedManufacturers;
    mapping(address => uint256[]) public manufacturerProducts;

    event ProductRegistered(uint256 productId, string name, address manufacturer);
    event ManufacturerApproved(address manufacturer);
    event ManufacturerRevoked(address manufacturer);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can do this");
        _;
    }

    modifier onlyApprovedManufacturer() {
        require(approvedManufacturers[msg.sender], "Not an approved manufacturer");
        _;
    }

    function approveManufacturer(address _manufacturer) public onlyAdmin {
        approvedManufacturers[_manufacturer] = true;
        emit ManufacturerApproved(_manufacturer);
    }

    function revokeManufacturer(address _manufacturer) public onlyAdmin {
        approvedManufacturers[_manufacturer] = false;
        emit ManufacturerRevoked(_manufacturer);
    }

    function registerProduct(
        uint256 _productId,
        string memory _name,
        string memory _batchNumber,
        string memory _manufacturingDate,
        string memory _description
    ) public onlyApprovedManufacturer {
        require(!products[_productId].exists, "Product ID already exists");

        products[_productId] = Product({
            productId: _productId,
            name: _name,
            batchNumber: _batchNumber,
            manufacturingDate: _manufacturingDate,
            description: _description,
            manufacturer: msg.sender,
            exists: true
        });

        manufacturerProducts[msg.sender].push(_productId);
        emit ProductRegistered(_productId, _name, msg.sender);
    }

    function verifyProduct(uint256 _productId) public view returns (
        string memory name,
        string memory batchNumber,
        string memory manufacturingDate,
        string memory description,
        address manufacturer,
        bool exists
    ) {
        Product memory p = products[_productId];
        return (
            p.name,
            p.batchNumber,
            p.manufacturingDate,
            p.description,
            p.manufacturer,
            p.exists
        );
    }

    function getManufacturerProducts(address _manufacturer) public view returns (uint256[] memory) {
        return manufacturerProducts[_manufacturer];
    }

    function isApprovedManufacturer(address _manufacturer) public view returns (bool) {
        return approvedManufacturers[_manufacturer];
    }
}