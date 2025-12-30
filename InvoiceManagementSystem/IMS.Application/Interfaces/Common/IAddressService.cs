using IMS.Application.DTOs.Common;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace IMS.Application.Interfaces.Common
{
    public interface IAddressService
    {
        Task<IEnumerable<AddressDto>> GetAllAsync();
        Task<AddressDto?> GetByIdAsync(Guid id);
        Task<AddressDto> CreateAsync(CreateAddressDto dto);
        Task<AddressDto?> UpdateAsync(Guid id, CreateAddressDto dto);
        Task<bool> DeleteAsync(Guid id);
    Task<bool> LinkToOwnerAsync(Guid addressId, IMS.Domain.Enums.OwnerType ownerType, Guid ownerId, bool isPrimary = false, bool allowMultiple = false);
        Task<bool> UnlinkFromOwnerAsync(Guid addressId, IMS.Domain.Enums.OwnerType ownerType, Guid ownerId);
        Task<IEnumerable<AddressDto>> GetForOwnerAsync(IMS.Domain.Enums.OwnerType ownerType, Guid ownerId);
    }
}
