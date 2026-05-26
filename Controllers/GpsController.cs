using Microsoft.AspNetCore.Mvc;

namespace GpsTrackerApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GpsController : ControllerBase
    {
        private static string _lastLocationData = "No data yet";
        private static readonly HttpClient _httpClient = new HttpClient();

        [HttpPost("fetch-location")]
        public async Task<IActionResult> FetchLocation()
        {
            var url = "https://app.gpstrack.in/api/get_current_data?token=cqzFZ57r1rLz9G7YQRzn5RQtflKLum5H&email=pragasam1016@gmail.com";
            try
            {
                var response = await _httpClient.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    _lastLocationData = await response.Content.ReadAsStringAsync();
                    return Ok(new { message = "Location fetched successfully", data = _lastLocationData });
                }
                return StatusCode((int)response.StatusCode, "Failed to fetch location data");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("get-location")]
        public IActionResult GetLocation()
        {
            return Ok(new { location = _lastLocationData });
        }
    }
}
