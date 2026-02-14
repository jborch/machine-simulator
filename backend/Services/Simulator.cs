using Microsoft.Extensions.Logging;
using MachineSimulator.Backend.Stations;

namespace MachineSimulator.Backend.Services;

public class Simulator
{
    private readonly List<IStation> _stations = new();
    private readonly ILogger<Simulator> _logger;

    public Simulator(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<Simulator>();
        _stations.Add(new DeNestingStation(loggerFactory));
        _stations.Add(new CappingStation(loggerFactory));
        _stations.Add(new RejectStation(loggerFactory));
        _stations.Add(new PackingStation(loggerFactory));
        _stations.Add(new BufferStation(loggerFactory));
    }

    public void Tick()
    {
        foreach (var station in _stations)
        {
            station.Tick();
        }

        for (int i = 0; i < _stations.Count; i++)
        {
            var station = _stations[i];
            if (!station.HasOutput)
                continue;

            var nextStation = _stations[(i + 1) % _stations.Count];
            if (!nextStation.CanReceive)
                continue;

            var mover = station.Send();
            if (mover != null)
            {
                nextStation.Receive(mover);
                _logger.LogDebug("Moved {MoverId} from {Source} to {Destination}", mover.Id, station.Name, nextStation.Name);
            }
        }
    }

    public async Task Run()
    {
        _logger.LogInformation("Simulator running with {StationCount} stations.", _stations.Count);

        while (true)
        {
            Tick();
            await Task.Delay(10);
        }
    }
}
