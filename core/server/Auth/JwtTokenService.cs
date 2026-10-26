using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Server.Models;

namespace Server.Auth;

public class JwtTokenService(IOptions<JwtOptions> options)
{
    private readonly JwtOptions _options = options.Value;

    public (string Token, DateTime ExpiresAt) CreateToken(User user)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_options.ExpiresMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim("name", user.Username),
            new Claim("role", user.Role),
            new Claim("full_name", user.FullName),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
