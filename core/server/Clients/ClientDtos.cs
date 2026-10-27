using System.Net.Mail;
using System.Text.RegularExpressions;
using Server.Models;

namespace Server.Clients;

public record ClientRequest(
    string CompanyName,
    string LegalName,
    string? Industry,
    string? FirstName,
    string? LastName,
    string? JobTitle,
    string? TaxId,
    string? PhoneNumber,
    string? Email,
    string? Website,
    string? Address,
    string? District,
    string? Province)
{
    public string? Validate()
    {
        if (string.IsNullOrWhiteSpace(CompanyName) || string.IsNullOrWhiteSpace(LegalName))
            return "El nombre comercial y la razón social son obligatorios.";

        var taxId = Clean(TaxId);
        if (taxId is not null && !Regex.IsMatch(taxId, @"^\d{11}$"))
            return "El RUC debe tener 11 dígitos.";

        var email = Clean(Email);
        if (email is not null && !MailAddress.TryCreate(email, out _))
            return "El email no es válido.";

        var website = Clean(Website);
        if (website is not null &&
            !(Uri.TryCreate(website, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)))
            return "El sitio web debe empezar con http:// o https://.";

        return null;
    }

    public void ApplyTo(Client client)
    {
        client.CompanyName = CompanyName.Trim();
        client.LegalName = LegalName.Trim();
        client.Industry = Clean(Industry);
        client.FirstName = Clean(FirstName);
        client.LastName = Clean(LastName);
        client.JobTitle = Clean(JobTitle);
        client.TaxId = Clean(TaxId);
        client.PhoneNumber = Clean(PhoneNumber);
        client.Email = Clean(Email);
        client.Website = Clean(Website);
        client.Address = Clean(Address);
        client.District = Clean(District);
        client.Province = Clean(Province);
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public record ClientFilters(List<string> Industries, List<string> Provinces);
