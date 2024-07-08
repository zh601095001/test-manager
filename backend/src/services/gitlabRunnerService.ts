import GitlabRunner from '../models/GitlabRunner';

export const createGitlabRunner = async (data: IGitlabRunner): Promise<IGitlabRunner> => {
    const runner = new GitlabRunner(data);
    return runner.save();
};

export const getAllGitlabRunners = async (): Promise<IGitlabRunner[]> => {
    return GitlabRunner.find();
};

export const getGitlabRunnerById = async (id: string): Promise<IGitlabRunner | null> => {
    return GitlabRunner.findById(id);
};

export const updateGitlabRunner = async (id: string, data: Partial<IGitlabRunner>): Promise<IGitlabRunner | null> => {
    return GitlabRunner.findByIdAndUpdate(id, data, {new: true});
};

export const deleteGitlabRunner = async (id: string): Promise<IGitlabRunner | null> => {
    return GitlabRunner.findByIdAndDelete(id);
};
