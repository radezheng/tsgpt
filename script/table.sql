DROP TABLE IF EXISTS tblGPTApps;
CREATE TABLE tblGPTApps
(
    app_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL UNIQUE,
    description NVARCHAR(MAX),
    dataground NVARCHAR(MAX),
    temperature FLOAT,
    max_tokens INT,
    top_p FLOAT,
    welcome NVARCHAR(MAX)
);

insert into tblGPTApps (name, description, dataground, temperature, max_tokens, top_p, welcome) 
values ('serious-bot', '认真的', '你是一名老师，乐意回答各种问题。如果你不知道的，请说不知道。', 0, 1000, 1, '您好, 您正在与Azure OpenAI聊天,如果想保留聊天内容,可以按Ctrl + S来保存哦。');

insert into tblGPTApps (name, description, dataground, temperature, max_tokens, top_p, welcome) 
values ('open-bot', '创造性的', '你是一名创造性非常强的知识渊博的人工知能助手，请发挥你的创意，回答各种问题。', 1, 1000, 1, '您好, 您正在与Azure OpenAI聊天,如果想保留聊天内容,可以按Ctrl + S来保存哦。');
