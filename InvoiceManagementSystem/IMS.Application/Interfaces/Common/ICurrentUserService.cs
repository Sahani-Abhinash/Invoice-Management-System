using System;

namespace IMS.Application.Interfaces.Common
{
    public interface ICurrentUserService
    {
        Guid? UserId { get; }
    }
}
