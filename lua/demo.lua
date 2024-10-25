local json = require('json')

local printData = function(k, v)
    local _data = {
        Key = k,
        Value = v
    }
    print(_data)
end

local sendErrorMessage = function(msg, err, target)
    if not target then
        ao.send({ Target = msg.From, Error = true, Data = err })
        printData("Error", "Target" .. " " .. msg.From .. " " .. err)
    else
        ao.send({ Target = target, Error = true, Data = err })
        printData("Error", "Target" .. " " .. target .. " " .. err)
    end
end

Submissions = Submissions or {}

Handlers.add(
    "Submit",
    Handlers.utils.hasMatchingTag("Action", "Submit"),
    function(msg)
        local success, err = pcall(function()
            if type(msg.Tags.Name) ~= 'string' or msg.Tags.Name == "" then
                sendErrorMessage(msg, 'Name is required and must be a string')
                return
            end

            if type(msg.Tags.SubmittedBy) ~= 'string' or msg.Tags.SubmittedBy == "" then
                sendErrorMessage(msg, 'Submitted By is required and must be a string')
                return
            end

            if type(msg.Tags.Link) ~= 'string' or msg.Tags.Link == "" then
                sendErrorMessage(msg, 'Link is required and must be a string')
                return
            end

            if type(msg.Tags.WalletAddress) ~= 'string' or msg.Tags.WalletAddress == "" then
                sendErrorMessage(msg, 'Wallet Address is required and must be a string')
                return
            end

            -- Optional Info field
            local _info
            if msg.Tags.Info then
                _info = json.decode(msg.Tags.Info)
                if type(_info) ~= 'table' then
                    sendErrorMessage(msg, 'Info must be a JSON object')
                    return
                end
            end

            local submission = {
                Name = msg.Tags.Name,
                DateSubmitted = msg["Timestamp"],
                SubmittedBy = msg.Tags.SubmittedBy,
                Link = msg.Tags.Link,
                WalletAddress = msg.Tags.WalletAddress,
                Info = _info
            }
            printData("submission", submission)

            table.insert(Submissions, submission)
            ao.send({ Target = msg.From, Data = "Submission successful" })
        end)

        if not success then
            sendErrorMessage(msg, 'An unexpected error occurred: ' .. tostring(err))
        end
    end

)
