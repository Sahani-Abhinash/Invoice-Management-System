using IMS.Application.Interfaces.Common;
using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace IMS.API.Services.Common
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid? UserId
        {
            get
            {
                var user = _httpContextAccessor.HttpContext?.User;
                if (user == null) return null;
                var id = user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? user.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
                if (Guid.TryParse(id, out var guid)) return guid;
                return null;
            }
        }
    }
}
