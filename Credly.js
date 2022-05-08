function checkBadges(emailArray){
    emailArray.forEach(x => {
        var options = {
          'method': 'GET',
          'url': 'https://api.credly.com/v1/organizations/4b74de99-bfb3-4f61-a50e-a7a336f322e7/badges?filter=recipient_email_all::' + x,
          'headers': {
              'Content-Type': 'application/json',
              'Authorization': 'Basic TlI2SkxCS0F2dTMyZHVVT2cxN1VDbGhXVGdZUENmbzc0SjEtXzFoMDo='
          },
        };
        request(options, (error, response) => {
            if(error) throw new Error(error);
            var body = response.body
            body = JSON.parse(body)
            const data = body.data
            const badge_results = []

            for(var i in data)
              if(data[i].recipient_email != undefined && i != 0)
                  badge_results.push([i, data[i].recipient_email, data[i].badge_template.id, data[i].badge_template.name, data[i].badge_template.state, data[i].user.id])
                  
                  badge_results.forEach(badge_result => {
                      var recipient_email = badge_result[1]
                      var badge_id = badge_result[2]
                      var badge_name = badge_result[3]
                      var badge_state = badge_result[4]
                      var user_id = badge_result[5]
                  connection.query(query6, [recipient_email, badge_id, badge_name, badge_state, user_id], (err, rows, results) => {
                      if(err) console.log(err.message);
                      
                      resolve(results);
                      
                  })
              })                
        })
    })
};