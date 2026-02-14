namespace MachineSimulator.Backend.Models;

public interface IMover
{
    string Id { get; }
    IItem? CurrentItem { get; }
    void Load(IItem item);
    void Unload();
}
