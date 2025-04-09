import ldap, {
  SearchCallbackResponse,
  SearchOptions,
  SearchEntry,
} from "ldapjs";
import dotenv from "dotenv";
import config from "../config/index.config";

dotenv.config();

const LDAP_URL = config.ldap.url;
const BIND_DN = config.ldap.bindDN;
const BIND_PASSWORD = config.ldap.bindPassword;
const BASE_DN = config.ldap.searchBase;

interface MyUser {
  dn: string;
  uidNumber: string;
  cn: string;
  mail: string;
  gidNumber: string;
}

// Helper function to convert entry.attributes array to a plain object
const ldapEntryToObject = (entry: SearchEntry): Partial<MyUser> => {
  const obj: Partial<MyUser> = {};
  for (const attribute of entry.attributes) {
    if (attribute.type && attribute.values && attribute.values.length > 0) {
      obj[attribute.type as keyof MyUser] = attribute.values[0];
    }
  }
  return obj;
};

export const authenticateUser = async (email: string, password: string) => {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({ url: LDAP_URL });

    client.bind(BIND_DN, BIND_PASSWORD, (err) => {
      if (err) return reject(new Error("Admin Bind Failed"));

      const opts: SearchOptions = {
        filter: `(mail=${email})`,
        scope: "sub",
        attributes: ["uidNumber", "cn", "mail", "gidNumber"], // don't ask for "dn" here
      };

      client.search(BASE_DN, opts, (err, res) => {
        if (err) {
          client.unbind();
          return reject(new Error("LDAP Search Error"));
        }

        let userDn = "";
        let uidNumber: string | null = null;
        let fullName: string | null = null;
        let employeeEmail: string | null = null;
        let employeeCenter: string | null = null;
        let gidNumber: string | null = null;

        res.on("searchEntry", (entry: SearchEntry) => {
          userDn = entry.dn.toString(); 
          console.log("User DN:", userDn);

          const obj = ldapEntryToObject(entry) as MyUser;
          uidNumber = obj.uidNumber;
          fullName = obj.cn;
          employeeEmail = obj.mail;
          
          const centreMatch = userDn.match(/ou=([A-Z]{2}),ou=User/i);
          employeeCenter = centreMatch ? centreMatch[1].toUpperCase() : null;

          console.log("UID Number:", uidNumber);
          console.log("Full Name:", fullName);
          console.log("Email:", employeeEmail);
          console.log("Centre:", employeeCenter);
        });

        res.on("end", async () => {
          if (!userDn || !employeeEmail) {
            client.unbind();
            return reject(new Error("User not found"));
          }

          client.bind(userDn, password, async (err) => {
            if (err) {
              client.unbind();
              return reject(new Error("Invalid Credentials"));
            }
            console.log("user authenticated");

            client.unbind();
            resolve({
              uidNumber,
              fullName,
              employeeEmail,
              employeeCenter,
            });
          });
        });
      });
    });
  });
};

interface LdapUser {
  employeeEmail: string;
  fullName: string;
}

// searching a user by uidnumber
export const findUserByIdentifier = async (identifier:number):Promise<LdapUser> => {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({ url: LDAP_URL });

    // Bind to the LDAP server
    client.bind(BIND_DN, BIND_PASSWORD, (err) => {
      if (err) {
        client.unbind();
        return reject(new Error("Admin Bind Failed"));
      }

      // Define search options
      const opts: SearchOptions = {
        filter: `uidNumber=${identifier}`,
        scope: "sub",
        attributes: ["cn", "mail"],
      };
       
      // Perform the search
      client.search(BASE_DN, opts, (err, res) => {
        if (err) {
          client.unbind();
          return reject(new Error("LDAP Search Error"));
        }

         let fullName: string | null = null;
         let employeeEmail: string | null = null;

        res.on("searchEntry", (entry:SearchEntry) => {
          const obj = ldapEntryToObject(entry) as MyUser;
          fullName = obj.cn;
          employeeEmail = obj.mail;
          console.log("Full Name:", fullName);
          console.log("email:", employeeEmail);
      
        });

        res.on("error", (err) => {
          client.unbind();
          reject(new Error(`LDAP Search Error: ${err.message}`));
        });

        res.on("end", (result) => {
          if (!fullName || !employeeEmail) {
            client.unbind();
            reject(new Error("User not found"));
          } else {
            resolve({
              employeeEmail,
              fullName
            })
          }
          client.unbind();
        });
      });
    });
  });
};



